const router = require('express').Router();

router.post('/facebook-webhook', (req, res) => {
  res.json({ success: true, message: 'Facebook webhook - to be implemented' });
});

module.exports = router;
