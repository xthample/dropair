// Import required modules
const axios = require('axios');
const prompt = require('prompt-sync')();
const { Spinner } = require('cli-spinner');

// Load environment variables from .env file
require('dotenv').config();

// Set up an array of auth cookies (add each cookie to this array)
const authCookies = process.env.AUTH_COOKIES.split(",");  // Format in .env: AUTH_COOKIES=cookie1,cookie2,cookie3
const checkInUrl = 'https://dropair.io/api/tasks';

// Function to display the welcome message
function displayWelcomeMessage() {
    console.log("=========================================");
    console.log("=   Welcome to Dropair Daily Check-In   =");
    console.log("=          Created By 0xarvi            =");
    console.log("=========================================");
    console.log("1. Claim Daily");
    console.log("2. Exit");
}

// Function to add delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to handle the daily check-in for a single cookie
async function claimDailyReward(authCookie, index) {
    // Set up spinner animation
    const spinner = new Spinner(`Account ${index + 1}: Checking reward status... %s`);
    spinner.setSpinnerString('|/-\\');
    spinner.start();

    try {
        const response = await axios.post(checkInUrl, 
            { taskId: "daily-task" },  // Payload needed
            {
                headers: {
                    'Cookie': `auth_token=${authCookie}`,  // Adding cookie for authentication
                    'Content-Type': 'application/json'
                }
            }
        );

        spinner.stop(true); // Stop the spinner once the response is received

        if (response.data.success) {
            console.log(`✅ Account ${index + 1}: Daily reward claimed successfully!`);
        } else if (response.data.message === "You have already claimed today" || response.data.error === "Daily task already completed") {
            console.log(`🔄 Account ${index + 1}: You have already claimed today!`);
        } else {
            console.log(`⚠️ Account ${index + 1}: Failed to claim daily reward: ${response.data.message}`);
        }
    } catch (error) {
        spinner.stop(true); // Stop the spinner on error
        console.error(`❌ Account ${index + 1}: Error while claiming daily reward:`, error.response?.data || error.message);
    }
}

// Main function
async function main() {
    displayWelcomeMessage();
    const choice = prompt("Please choose an option: ");

    if (choice === "1") {
        console.log("Starting daily check-in for all accounts...");
        for (let i = 0; i < authCookies.length; i++) {
            await claimDailyReward(authCookies[i], i);
            await sleep(2000); // Delay 2 seconds before the next claim (adjust as needed)
        }
        console.log("✅ All accounts have attempted daily check-in.");
    } else {
        console.log("Exiting... Have a great day!");
    }
}

// Run the main function
main();
