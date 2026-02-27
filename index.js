const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();

// Debug: Check if token loaded
console.log('Token loaded:', process.env.HUBSPOT_ACCESS_TOKEN ? 'Yes (' + process.env.HUBSPOT_ACCESS_TOKEN.substring(0, 15) + '...)' : 'NO - TOKEN NOT FOUND!');

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// HubSpot API configuration
const HUBSPOT_API = 'https://api.hubapi.com';
const headers = {
    Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
};

// ===========================================
// ROUTE 1: Homepage - Display contacts table
// ===========================================
app.get('/', async (req, res) => {
    try {
        const response = await axios.get(
            `${HUBSPOT_API}/crm/v3/objects/contacts`,
            {
                headers,
                params: {
                    limit: 100,
                    properties: 'firstname,lastname,email,favorite_game,genre,platform'
                }
            }
        );

        const contacts = response.data.results;

        res.render('homepage', {
            title: 'Contacts | HubSpot Practicum',
            contacts: contacts
        });
    } catch (error) {
        console.error('Error fetching contacts:', error.response?.data || error.message);
        res.render('homepage', {
            title: 'Contacts | HubSpot Practicum',
            contacts: [],
            error: 'Failed to fetch contacts from HubSpot'
        });
    }
});

// ===========================================
// ROUTE 2: Form page to add new contact
// ===========================================
app.get('/update-cobj', (req, res) => {
    res.render('updates', {
        title: 'Update Custom Object Form | Integrating With HubSpot I Practicum'
    });
});

// ===========================================
// ROUTE 3: Handle form submission - create contact
// ===========================================
app.post('/update-cobj', async (req, res) => {
    try {
        const { firstname, lastname, email, favorite_game, genre, platform } = req.body;

        const payload = {
            properties: {
                firstname: firstname,
                lastname: lastname,
                email: email,
                favorite_game: favorite_game,
                genre: genre,
                platform: platform
            }
        };

        await axios.post(
            `${HUBSPOT_API}/crm/v3/objects/contacts`,
            payload,
            { headers }
        );

        console.log('Contact created:', { firstname, email, favorite_game });
        res.redirect('/');
    } catch (error) {
        console.error('Error creating contact:', error.response?.data || error.message);
        res.render('updates', {
            title: 'Update Custom Object Form | Integrating With HubSpot I Practicum',
            error: 'Failed to create contact: ' + (error.response?.data?.message || error.message)
        });
    }
});

// Start Server
app.listen(3000, () => console.log('Listening on http://localhost:3000'));
