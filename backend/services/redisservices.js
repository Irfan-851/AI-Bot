// const  Redis = require('ioredis');

// const redis = new Redis({
//     host: process.env.REDIS_HOST,
//     port: process.env.REDIS_PORT,
//     password: process.env.REDIS_PASSWORD,
// });

// redis.on('connect', () => {
//     console.log('Connected to Redis');
// }
// )

// module.exports = redis;



// Dummy redis client for compatibility
const redis = {
    get: async () => null,
    set: async () => null,
    on: () => {},
};

module.exports = redis;