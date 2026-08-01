const mongoose = require('mongoose');

const paymentConfigSchema = new mongoose.Schema(
  {
    bkash_number: {
      type: String,
      default: '',
      trim: true,
    },
    nagad_number: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

paymentConfigSchema.statics.getSingleton = async function () {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({
      bkash_number: '017XX-XXXXXX',
      nagad_number: '017XX-XXXXXX',
    });
  }
  return config;
};

module.exports = mongoose.model('PaymentConfig', paymentConfigSchema);
