
try {
    console.log('Loading payments route...');
    require('./routes/payments');
    console.log('✅ Payments route loaded');
} catch (e) {
    console.error('❌ Failed to load payments route');
    console.error(e);
}
