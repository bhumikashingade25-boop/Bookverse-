const axios = require('axios');

/**
 * n8n Workflow Automation Integration Service
 * Dispatches event payloads to an n8n webhook (or logs gracefully if unavailable)
 */
const triggerN8nWorkflow = async (eventType, payload) => {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const timestamp = new Date().toISOString();

  console.log(`[n8n Automation Event] [${eventType}] Triggered at ${timestamp}`);

  if (!webhookUrl) {
    console.log(`[n8n Automation Mock] Webhook simulated successfully for event '${eventType}'`);
    return { success: true, mode: 'mock', eventType, payload };
  }

  try {
    const response = await axios.post(webhookUrl, {
      eventType,
      timestamp,
      data: payload
    }, { timeout: 3000 });

    console.log(`[n8n Automation Success] Event '${eventType}' delivered to ${webhookUrl}`);
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    console.warn(`[n8n Automation Warning] Could not reach webhook ${webhookUrl}: ${error.message}`);
    return { success: false, mode: 'fallback', error: error.message };
  }
};

module.exports = { triggerN8nWorkflow };
