const PaymentConfig = require('../models/PaymentConfig');
const AppError = require('../utils/AppError');

const BD_MOBILE_REGEX = /^01[3-9]\d{8}$/;
const DEFAULT_PLACEHOLDER = '017XX-XXXXXX';

const getPaymentConfig = async (req, res, next) => {
  try {
    const config = await PaymentConfig.getSingleton();
    res.json({
      success: true,
      data: {
        config: {
          bkash_number: config.bkash_number || DEFAULT_PLACEHOLDER,
          nagad_number: config.nagad_number || DEFAULT_PLACEHOLDER,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

const updatePaymentConfig = async (req, res, next) => {
  try {
    const { bkash_number, nagad_number } = req.body;

    const normalize = (value) => String(value || '').trim();
    const bkash = normalize(bkash_number);
    const nagad = normalize(nagad_number);

    [bkash, nagad].forEach((value) => {
      if (value && !BD_MOBILE_REGEX.test(value)) {
        throw new AppError('Merchant numbers must be valid 11-digit Bangladeshi mobile numbers.', 400);
      }
    });

    const config = await PaymentConfig.getSingleton();
    config.bkash_number = bkash;
    config.nagad_number = nagad;
    await config.save();

    res.json({
      success: true,
      data: {
        config: {
          bkash_number: config.bkash_number,
          nagad_number: config.nagad_number,
        },
      },
      message: 'Payment settings updated successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPaymentConfig, updatePaymentConfig };
