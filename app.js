import express from 'express';
const app = express();
import mongoose from 'mongoose';
import Listing from './models/listing.js';
import path from 'path';
import methodOverride from 'method-override';
import ejsMate from 'ejs-mate';
import wrapAsync from './utils/wrapAsync.js';
import ExpressError from "./utils/ExpressError.js";
import listingSchema from './schema.js';
import Review from './models/review.js';

app.use((req, res, next) => {
    console.log('Request URL:', req.url);
    next();
});

app.engine('ejs',ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(process.cwd(), 'public')));

async function main() {
    await mongoose.connect('mongodb://localhost:27017/wanderlust');
    console.log('Connected to MongoDB');
}
main()
    .then(() => console.log('MongoDB connection established'))
    .catch(err => console.error('MongoDB connection error:', err));

app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map(el => el.message).join(',');
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

//Index route
app.get('/listings', wrapAsync(async (req, res) => {
    try {
        const listings = await Listing.find({});
        res.render('listings/index.ejs', { listings });
    } catch (err) {
        console.error('Error fetching listings:', err);
        res.status(500).send('Error fetching listings');
    }
}));

//new route
app.get('/listings/new', (req, res) => {
    res.render('listings/new.ejs', { listing: {} });
});

//Show route
app.get('/listings/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    try {
        const listing = await Listing.findById(id);
        if (!listing) {
            // Use your error handler for not found
            return next(new ExpressError('Listing not found', 404));
        }
        res.render('listings/show.ejs', { listing });
    } catch (err) {
        next(err); // Pass all errors to the error handler
    }
}));

//Create route
app.post('/listings', validateListing,  wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);    
    await newListing.save();
    res.redirect(`/listings`);
}));

// Edit route
app.get('/listings/:id/edit', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render('listings/edit.ejs', { listing });
}));

// Update route
app.put('/listings/:id', validateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const updatedListing = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });
    res.redirect(`/listings/${updatedListing._id}`);
}));

// Delete route
app.delete('/listings/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect('/listings');
}));

//Reviews
//Post Route
app.post("/listings/:id/reviews", async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    console.log("new review saved");
    res.send('Review added successfully');
})

// app.get('/listings', async (req, res) => {
//     let sampleListing = new Listing({
//         title: 'Sample Listing',
//         description: 'This is a sample listing description.',
//         image: '',
//         price: 100,
//         location: 'Sample Location',
//         country: 'Sample Country'
//     });
//     await sampleListing.save();
//     res.send('Listing created');
//     console.log('Sample listing created:', sampleListing);
// });

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong' } = err;
    res.status(statusCode).render('error.ejs', { err });
    // res.status(statusCode).send(message);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});