const aiServices = require('../services/aiServices');

const getResult = async (req, res) => {
    try {
        const { prompt } = req.query;
        if (!prompt) {
            return res.status(400).send({ message: "Prompt is required" });
        }
        const result = await aiServices.generateResult([prompt]);
        console.log(result);
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: error.message });
    }
};

module.exports = { getResult };



