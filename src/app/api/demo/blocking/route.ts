// POST localhost:3000/api/demo/blocking

import { generateText } from "ai";
import { anthropic } from '@ai-sdk/anthropic';

// you can change the model to googl in line 17
import { google } from "@ai-sdk/google"

// Another way to implement
// import { createGoogleGenerativeAI } from "@ai-sdk/google"
// const google = createGoogleGenerativeAI({
//     apiKey: ...
// });

export async function POST() {
    const response = await generateText({
        model: anthropic('claude-3-haiku-20240307'),
        prompt: 'Write a vegetarian lasagna recipe for 4 people.',
        experimental_telemetry: {
            isEnabled: true,
            recordInputs: true,
            recordOutputs: true
        }
    });

    return Response.json({ response });
}