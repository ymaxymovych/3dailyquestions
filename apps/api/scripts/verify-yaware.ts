import axios from 'axios';

const RAPIDAPI_KEY = "ab6fbeda98msh6a304c68759bf0ap1f7cccjsna5db737eedf1";
const RAPIDAPI_HOST = "yaware-timetracker.p.rapidapi.com";
const YAWARE_ACCESS_KEY = "4226fd9ae16a8df6b62f093929-29910-1441961835";

async function verifyYawareConnection() {
    console.log('Testing Yaware API connection...');
    console.log(`Host: ${RAPIDAPI_HOST}`);
    console.log(`Access Key: ${YAWARE_ACCESS_KEY.substring(0, 5)}...`);

    try {
        const today = new Date().toISOString().split('T')[0];

        console.log(`Attempting POST https://${RAPIDAPI_HOST}/getEmployeeProductivity...`);

        // Using getEmployeeProductivity as it is the main endpoint used in the service
        // We'll try with a dummy employeeId, hoping for a 200 (empty data) or a specific error other than 404
        const response = await axios.post(`https://${RAPIDAPI_HOST}/getEmployeeProductivity`,
            {
                access_key: YAWARE_ACCESS_KEY,
                employeeId: "0",
                date: today
            },
            {
                headers: {
                    'X-RapidAPI-Key': RAPIDAPI_KEY,
                    'X-RapidAPI-Host': RAPIDAPI_HOST,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Response status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
        console.log('✅ Yaware API connection successful!');
    } catch (error: any) {
        console.error('❌ Yaware API connection failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

verifyYawareConnection();
