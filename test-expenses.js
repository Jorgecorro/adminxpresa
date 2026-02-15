const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://api.xpresa.com.mx';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzA3MDIwMjQsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6ImFub24iLCJpc3MiOiJzdXBhYmFzZSJ9.L4llk8-h15_rdu9nV2C0GWs9yrj8UyR3HHQDQYHhvzA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('--- TEST: ANON INSERT EN ORDERS ---');

    const { data, error } = await supabase.from('orders').insert({
        customer_name: 'Test Anon',
        total_amount: 0,
        vendedor_id: '53c7bd5b-1388-4c44-aeeb-a18603ab1ba8'
    });

    if (error) {
        console.error('ERROR EN ORDERS:', error.message);
    } else {
        console.log('¡Insert en ORDERS funcionó sin auth! Esto significa que las políticas de ORDERS son más permisivas o el RLS está desactivado ahí.');
    }
}

check();
