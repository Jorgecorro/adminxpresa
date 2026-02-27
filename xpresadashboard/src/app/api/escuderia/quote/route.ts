import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const {
        originZip,
        destinationZip,
        originAddress,
        destinationAddress,
        weight,
        length,
        width,
        height
    } = await req.json();

    const enviaKey = process.env.ENVIA_API_KEY;

    if (!enviaKey) {
        return NextResponse.json({ error: 'Falta API Key de Envia.com' }, { status: 500 });
    }

    const stateMap: Record<string, string> = {
        'aguascalientes': 'AG', 'baja california': 'BC', 'baja california sur': 'BS',
        'campeche': 'CM', 'chiapas': 'CS', 'chihuahua': 'CH', 'coahuila': 'CO',
        'colima': 'CL', 'ciudad de mexico': 'DF', 'cdmx': 'DF', 'distrito federal': 'DF',
        'durango': 'DG', 'guanajuato': 'GT', 'guerrero': 'GR', 'hidalgo': 'HG',
        'jalisco': 'JA', 'mexico': 'EM', 'estado de mexico': 'EM', 'michoacan': 'MI',
        'morelos': 'MO', 'nayarit': 'NA', 'nuevo leon': 'NL', 'oaxaca': 'OA',
        'puebla': 'PU', 'queretaro': 'QA', 'quintana roo': 'QR', 'san luis potosi': 'SL',
        'sinaloa': 'SI', 'sonora': 'SO', 'tabasco': 'TB', 'tamaulipas': 'TM',
        'tlaxcala': 'TL', 'veracruz': 'VE', 'yucatan': 'YU', 'zacatecas': 'ZA'
    };

    const normalizeState = (state: string) => {
        if (!state) return 'MX';
        const s = state.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        return stateMap[s] || (state.length <= 3 ? state.toUpperCase() : 'MX');
    };

    // Lista de paqueterías comunes en México para cotizar
    const CARRIERS = ['estafeta', 'redpack', 'fedex', '99minutos', 'dhl', 'paquetexpress', 'sendex'];

    try {
        const payloadBase = {
            origin: {
                name: originAddress?.name || "Xpresa Remitente",
                company: "Xpresa",
                email: "ventas@xpresa.com.mx",
                phone: "4421234567",
                street: originAddress?.street || "Av. Constituyentes",
                number: "1",
                district: "Centro",
                city: originAddress?.city || "Queretaro",
                state: normalizeState(originAddress?.state || "QA"),
                country: "MX",
                postalCode: originZip || "76000"
            },
            destination: {
                name: destinationAddress?.name || "Cliente",
                company: "Particular",
                email: destinationAddress?.email || "cliente@xpresa.com.mx",
                phone: destinationAddress?.phone || "4420000000",
                street: destinationAddress?.street || "Conocida",
                number: "1",
                district: destinationAddress?.district || "Centro",
                city: destinationAddress?.city || "Ciudad",
                state: normalizeState(destinationAddress?.state || "MX"),
                country: "MX",
                postalCode: destinationZip
            },
            packages: [{
                content: "Ropa",
                amount: 1,
                type: "box",
                weight: weight || 1,
                weightUnit: "KG",
                dimensions: {
                    length: length || 20,
                    width: width || 20,
                    height: height || 10
                },
                lengthUnit: "CM"
            }],
            shipment: {
                type: 1 // Nacional
            }
        };

        console.log(`Cotizando con ${CARRIERS.length} carriers para CP: ${destinationZip}...`);

        const errors: any[] = [];
        const quotePromises = CARRIERS.map(async (carrier) => {
            try {
                const response = await fetch('https://api.envia.com/ship/rate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${enviaKey}`
                    },
                    body: JSON.stringify({
                        ...payloadBase,
                        shipment: { ...payloadBase.shipment, carrier }
                    })
                });

                const resData = await response.json();

                if (!response.ok || resData.meta === 'error') {
                    console.log(`Envia API Error [${carrier}]:`, response.status, JSON.stringify(resData));
                    const errorMsg = resData.error?.message || resData.message || resData.error?.description || 'Error desconocido';
                    errors.push({ carrier, error: errorMsg });
                    return null;
                }

                if (resData.meta === 'rate' && Array.isArray(resData.data)) {
                    console.log(`Éxito [${carrier}]: ${resData.data.length} tarifas encontradas.`);
                    if (resData.data.length > 0) {
                        console.log('Estructura de tarifa (ejemplo):', JSON.stringify(resData.data[0]).substring(0, 200));
                    }
                    return resData.data;
                }

                errors.push({ carrier, error: resData.message || 'Sin tarifas devueltas' });
                return null;
            } catch (err: any) {
                console.error(`Excepción cotizando con ${carrier}:`, err);
                errors.push({ carrier, error: err.message });
                return null;
            }
        });

        const results = await Promise.all(quotePromises);

        // Aplanamos y normalizamos los resultados
        const allRates = results
            .filter(r => r !== null)
            .flat()
            .map((rate: any) => ({
                provider: rate.carrier,
                service: rate.service,
                price: rate.totalPrice || rate.total_price || 0,
                days: rate.deliveryEstimate || rate.delivery_estimate || 'N/A',
                carrier_logo: rate.carrier_logo
            }))
            .sort((a, b) => a.price - b.price);

        if (allRates.length === 0) {
            return NextResponse.json({
                error: 'No se encontraron tarifas. Revisa CPs y direcciones.',
                details: errors.slice(0, 3)
            }, { status: 404 });
        }

        return NextResponse.json(allRates);

    } catch (error: any) {
        console.error('Excepción en API de cotización:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
