import mongoose from 'mongoose';
import data from './data.js';
import Listing from '../models/listing.js';

//connect to MongoDB and seed database
async function main() {
    await mongoose.connect('mongodb://localhost:27017/wanderlust');
    console.log('Connected to MongoDB');

    await Listing.deleteMany({});
    await Listing.insertMany(data.data); // or just data if exporting array directly
    console.log('Database initialized with sample data');
}

main()
    .then(() => {
        console.log('Database seeded with initial data');
    })
    .catch(err => {
        console.error('Error connecting to MongoDB or seeding database:', err);
    });