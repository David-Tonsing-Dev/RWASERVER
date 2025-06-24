const {
  disclamerTerm,
  privacyTerm,
  serviceTerm,
} = require("../../constant/term");

const getDisclamerTerm = async (req, res) => {
  try {
    if (!disclamerTerm)
      return res
        .status(404)
        .json({ status: false, message: "Disclamer not found" });

    return res.status(200).json({ status: 200, disclamer: disclamerTerm });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};

const getPrivacyTerm = async (req, res) => {
  try {
    if (!privacyTerm)
      return res
        .status(404)
        .json({ status: false, message: "Privacy not found" });

    return res.status(200).json({ status: 200, privacy: privacyTerm });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};

const getServiceTerm = async (req, res) => {
  try {
    if (!serviceTerm)
      return res
        .status(404)
        .json({ status: false, message: "Service not found" });

    return res.status(200).json({ status: 200, service: serviceTerm });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};

module.exports = {
  getDisclamerTerm,
  getPrivacyTerm,
  getServiceTerm,
};
