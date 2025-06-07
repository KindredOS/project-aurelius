// Import necessary libraries
import React, { useState } from 'react';
import { HfInference } from "@huggingface/inference"; // Hugging Face API

const client = new HfInference("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");

const FoodPrepPage = () => {
    const [query, setQuery] = useState('');
    const [dietaryRestrictions, setDietaryRestrictions] = useState({ vegan: false, glutenFree: false, nutFree: false });
    const [mealPlan, setMealPlan] = useState(Array(7).fill({ breakfast: '', lunch: '', dinner: '' }));
    const [loadingIndex, setLoadingIndex] = useState(null);

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setDietaryRestrictions((prev) => ({ ...prev, [name]: checked }));
    };

    const generateMeals = async (dayIndex) => {
        setLoadingIndex(dayIndex);

        const restrictions = Object.keys(dietaryRestrictions)
            .filter((key) => dietaryRestrictions[key])
            .join(', ');

        const prompt = `Generate unique meal ideas for breakfast, lunch, and dinner for Day ${dayIndex + 1}. Preferences: ${query}. Dietary restrictions: ${restrictions || 'none'}.`;

        try {
            const stream = client.chatCompletionStream({
                model: "NousResearch/Hermes-3-Llama-3.1-8B",
                messages: [
                    { role: "user", content: prompt }
                ],
                temperature: 0.9, // Higher temperature for more creative outputs
                max_tokens: 2048,
                top_p: 0.85
            });

            let mealText = "";
            for await (const chunk of stream) {
                if (chunk.choices && chunk.choices.length > 0) {
                    const newContent = chunk.choices[0].delta.content;
                    mealText += newContent;
                }
            }

            const suggestions = mealText.split('\n').filter((s) => s.trim()); // Remove empty lines
            setMealPlan((prev) => {
                const updatedPlan = [...prev];
                updatedPlan[dayIndex] = {
                    breakfast: suggestions[0] || 'No suggestion',
                    lunch: suggestions[1] || 'No suggestion',
                    dinner: suggestions[2] || 'No suggestion'
                };
                return updatedPlan;
            });
        } catch (error) {
            setMealPlan((prev) => {
                const updatedPlan = [...prev];
                updatedPlan[dayIndex] = {
                    breakfast: 'Error generating suggestions',
                    lunch: '',
                    dinner: ''
                };
                return updatedPlan;
            });
        } finally {
            setLoadingIndex(null);
        }
    };

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
            <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: '20px' }}>7-Day Meal Planner</h1>
            <p style={{ fontSize: '1.2rem', color: '#555', marginBottom: '20px' }}>Plan meals for the entire week with tailored suggestions.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                <label style={{ fontSize: '1rem', color: '#444' }}>
                    What are you hungry for?
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="E.g., Italian, spicy, quick meals"
                        style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ddd', borderRadius: '5px', width: '60%' }}
                    />
                </label>

                <div style={{ fontSize: '1rem', color: '#444' }}>
                    Dietary Restrictions:
                    <label style={{ marginLeft: '15px' }}>
                        <input
                            type="checkbox"
                            name="vegan"
                            checked={dietaryRestrictions.vegan}
                            onChange={handleCheckboxChange}
                        /> Vegan
                    </label>
                    <label style={{ marginLeft: '15px' }}>
                        <input
                            type="checkbox"
                            name="glutenFree"
                            checked={dietaryRestrictions.glutenFree}
                            onChange={handleCheckboxChange}
                        /> Gluten-Free
                    </label>
                    <label style={{ marginLeft: '15px' }}>
                        <input
                            type="checkbox"
                            name="nutFree"
                            checked={dietaryRestrictions.nutFree}
                            onChange={handleCheckboxChange}
                        /> Nut-Free
                    </label>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
                {mealPlan.map((day, index) => (
                    <div
                        key={index}
                        style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#fff' }}
                    >
                        <h3 style={{ fontSize: '1.2rem', color: '#333' }}>Day {index + 1}</h3>
                        <p><strong>Breakfast:</strong> {day.breakfast}</p>
                        <p><strong>Lunch:</strong> {day.lunch}</p>
                        <p><strong>Dinner:</strong> {day.dinner}</p>
                        <button
                            onClick={() => generateMeals(index)}
                            style={{ marginTop: '10px', padding: '5px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                            disabled={loadingIndex === index}
                        >
                            {loadingIndex === index ? 'Generating...' : 'Generate Meals'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FoodPrepPage;
