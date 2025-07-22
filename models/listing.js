import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: {
        // filename: { type: String },
        url: {
            type: String,
            set: (v) =>
                v === ""
                    ? "https://images.stockcake.com/public/8/9/e/89e06421-50d9-4546-a84b-39780f190cbe_large/elegant-hotel-lobby-stockcake.jpg"
                    : v,
        },
    },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    country: { type: String, required: true },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
});

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;