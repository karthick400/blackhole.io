const API_KEY = "AIzaSyB-G0pf56n1zMqZASF2CaaDUwL82aT5cf0";

async function analyzeIdea(title, description) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
    
    const prompt = `You are a startup idea validator for students. Analyze this idea and respond ONLY in valid JSON format with no extra text or markdown. Use exactly this structure:
{"tags":["tag1","tag2","tag3"],"feasibility":75,"originality":80,"impact":70,"verdict":"Your 2-3 sentence assessment here.","needsTeam":true,"suggestedRoles":["Frontend Developer","Backend Developer"],"suggestedTeamSize":"2-3 people"}
Idea Title: ${title}
Description: ${description}`;

    const defaultResult = {
        tags:["General"],
        feasibility:50,
        originality:50,
        impact:50,
        verdict:"Could not analyze — please try again.",
        needsTeam:true,
        suggestedRoles:["Developer"],
        suggestedTeamSize:"2-3 people"
    };

    try {
        const response = await fetch(url, {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({
                contents:[{parts:[{text:prompt}]}]
            })
        });
        const data = await response.json();
        console.log("Raw API response:", data);
        let text = data.candidates[0].content.parts[0].text;
        text = text.replace(/```json/g,"").replace(/```/g,"").trim();
        return JSON.parse(text);
    } catch(e) {
        console.error("Error:", e);
        return defaultResult;
    }
}