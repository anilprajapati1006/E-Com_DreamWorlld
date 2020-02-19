var mongoose = require('mongoose');
const schema = mongoose.Schema;

const orderSchema = new schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    userName: { type: mongoose.Schema.Types.String, required: true },
    cart: { type: Object, required: true },
    address: { type: String, required: true },
    name: { type: String, required: true },
    status: { type: String, required: true },
    paymentId: { type: String, required: true }
  },
  {
    timestamps: true,
    versionKey: false,
    minimize: false
  }
);

module.exports = mongoose.model('DND-Orders', orderSchema);
