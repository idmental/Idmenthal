
import { GoogleGenAI, Type } from "@google/genai";
import { PhotoAnalysis, AspectRatio } from "../types";

export const analyzePhoto = async (base64Image: string): Promise<PhotoAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
        {
          text: "Act as a world-class professional photographer. Analyze this photo for technical and artistic errors. Focus on lighting (shadows, exposure), composition (rule of thirds, balance), optics (blur, lens choice), and color. Be honest but constructive.",
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          lighting: { type: Type.STRING },
          composition: { type: Type.STRING },
          optics: { type: Type.STRING },
          color: { type: Type.STRING },
          suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["lighting", "composition", "optics", "color", "suggestions"]
      }
    }
  });

  try {
    const text = response.text || '{}';
    return JSON.parse(text) as PhotoAnalysis;
  } catch (e) {
    throw new Error("Failed to parse photo analysis.");
  }
};

export const enhancePhoto = async (
  base64Image: string, 
  userPrompt: string, 
  analysis?: PhotoAnalysis,
  tone: number = 0,
  autoColor: boolean = false,
  aspectRatio: AspectRatio = "1:1",
  sharpness: number = 0,
  cameraView: string = "default",
  zoomLevel: number = 0,
  bokeh: number = 0,
  cinematicGrade: boolean = false
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const modelName = 'gemini-2.5-flash-image';

  let systemContext = `You are a professional AI photography studio. Re-render this scene as if it were shot by a professional using a high-end DSLR with premium optics. Maintain the core subject and environment identity. `;
  
  if (analysis) {
    systemContext += `Address these specific flaws: ${analysis.suggestions.join(', ')}. `;
  }

  if (autoColor) {
    systemContext += "Perform professional auto-color correction: optimize white balance for natural tones and dynamic range. ";
  }

  if (cinematicGrade) {
    systemContext += "Apply a high-end professional cinematic color grade. Use sophisticated LUT-style processing with deep blacks, balanced highlights, and a rich, cohesive color palette similar to 35mm film or high-end Hollywood cinematography. ";
  }

  if (tone > 10) {
    systemContext += `Apply a warm, golden color temperature (level: ${tone}/100). `;
  } else if (tone < -10) {
    systemContext += `Apply a cool, blue cinematic color temperature (level: ${Math.abs(tone)}/100). `;
  }

  if (sharpness > 0) {
    systemContext += `Apply optical sharpening and micro-contrast enhancement (Intensity: ${sharpness}/100). `;
  }

  // Handle Bokeh / Depth of Field
  if (bokeh > 0) {
    systemContext += `Simulate a fast prime lens (e.g., f/1.4). Apply a shallow depth of field with artful bokeh. The background should have soft, circular out-of-focus highlights and smooth blur transitions. Bokeh intensity: ${bokeh}/100. `;
  }

  // Handle Zoom / Focal Length Simulation
  if (zoomLevel > 0) {
    systemContext += `Simulate a telephoto lens zoom. Crop in closer on the subject and compress the background (Zoom Intensity: ${zoomLevel}/50). `;
  } else if (zoomLevel < 0) {
    systemContext += `Simulate a wide-angle lens. Zoom out to show more of the surrounding environment and expand the field of view (Zoom Out Intensity: ${Math.abs(zoomLevel)}/50). `;
  }

  if (cameraView !== "default") {
    const perspectives: Record<string, string> = {
      "portrait": "Re-render as a classic professional portrait with shallow depth of field (bokeh background).",
      "close_up": "Change perspective to a front full face close-up, focusing intensely on the subject's facial details and eyes.",
      "mid_shot": "Re-render as a professional mid-shot (from waist up), balancing the subject and the immediate environment.",
      "left_side": "Virtually move the camera to the left side to capture a left-profile view of the subject.",
      "right_side": "Virtually move the camera to the right side to capture a right-profile view of the subject.",
      "top_view": "Change the perspective to a dramatic top-down birds-eye view looking straight down at the scene.",
      "full_body": "Re-render as a front full-body shot, showing the subject from head to toe."
    };
    systemContext += perspectives[cameraView] || "";
  }
  
  const finalPrompt = userPrompt || "Enhance this photo to professional standards: fix lighting, sharpen focus, balance colors, and optimize composition.";

  const response = await ai.models.generateContent({
    model: modelName,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
        {
          text: `${systemContext}\n\nTask: ${finalPrompt}`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio
      }
    }
  });

  const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (!imagePart || !imagePart.inlineData) {
    throw new Error("The AI failed to generate an enhanced image.");
  }

  return `data:image/png;base64,${imagePart.inlineData.data}`;
};
