import { AnalysisResult, SkinProfile } from '../types/glowup';

export interface AnalysisInput {
  imageDataUrl: string;
  sourceLabel: string;
  climate: 'dry' | 'temperate' | 'humid';
  sleepHours: 'under-6' | '6-to-8' | '8-plus';
  spfHabit: 'daily' | 'occasional' | 'rarely';
  profile: SkinProfile;
}

export interface ISkinAnalysisProvider {
  readonly mode: 'demonstration' | 'production-api';
  analyzeSkin(
    input: AnalysisInput,
    onProgress?: (stage: string, percent: number) => void
  ): Promise<AnalysisResult>;
}

/**
 * Inspects actual image canvas brightness/contrast locally so lighting
 * confidence limitations reflect the user's real uploaded photograph.
 */
async function inspectPhotoLighting(dataUrl: string): Promise<{ avgLuma: number; resolutionNote: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 48;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ avgLuma: 128, resolutionNote: `${img.naturalWidth}×${img.naturalHeight}px` });
          return;
        }
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        let sum = 0;
        for (let i = 0; i < data.length; i += 4) {
          sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
        }
        const avgLuma = sum / (size * size);
        resolve({
          avgLuma,
          resolutionNote: `${img.naturalWidth || 480}×${img.naturalHeight || 640}px`,
        });
      } catch {
        resolve({ avgLuma: 128, resolutionNote: 'Standard preview' });
      }
    };
    img.onerror = () => resolve({ avgLuma: 128, resolutionNote: 'Preview frame' });
    img.src = dataUrl;
  });
}

/**
 * Demonstration implementation.
 * Replace with a fetch('/api/skin-analysis') provider when connecting a
 * server-side vision model or dermatological inference pipeline.
 */
export class DemoSkinAnalysisProvider implements ISkinAnalysisProvider {
  readonly mode = 'demonstration' as const;

  async analyzeSkin(
    input: AnalysisInput,
    onProgress?: (stage: string, percent: number) => void
  ): Promise<AnalysisResult> {
    const stages: [string, number][] = [
      ['Normalizing ambient light & white balance', 22],
      ['Mapping hydration & surface reflection zones', 52],
      ['Cross-referencing your saved skin profile', 78],
      ['Preparing educational care guidance (Demonstration)', 100],
    ];

    for (const [label, pct] of stages) {
      onProgress?.(label, pct);
      await new Promise((r) => setTimeout(r, 420));
    }

    const { avgLuma, resolutionNote } = await inspectPhotoLighting(input.imageDataUrl);
    const lightingCaveat =
      avgLuma < 75
        ? 'Low ambient brightness detected in this frame — shadow areas limit visual clarity.'
        : avgLuma > 205
          ? 'Strong highlights detected — specular glare can mask fine surface texture.'
          : 'Balanced illumination detected for demonstration preview.';

    const isDryContext = input.climate === 'dry' || input.profile.skinType === 'dry';
    const isOilyContext = input.profile.skinType === 'oily' || input.profile.skinType === 'combination';
    const needsSpfFocus = input.spfHabit !== 'daily';

    const observations = [
      {
        zone: 'Cheek & Mid-Face Barrier',
        observation: isDryContext
          ? 'Profile and dry climate input suggest prioritizing water-binding humectants and ceramide sealing.'
          : 'Mid-face zone typically benefits from lightweight daytime hydration that preserves bounce.',
        focusLevel: (isDryContext ? 'Priority Care' : 'Balanced') as 'Balanced' | 'Mild Focus' | 'Priority Care',
      },
      {
        zone: 'T-Zone & Pore Equilibrium',
        observation: isOilyContext
          ? 'Combination/oily profile points toward gentle zinc or 5% niacinamide balancing rather than harsh stripping.'
          : 'Keep cleansing pH-neutral so natural protective lipids remain undisturbed.',
        focusLevel: (isOilyContext ? 'Mild Focus' : 'Balanced') as 'Balanced' | 'Mild Focus' | 'Priority Care',
      },
      {
        zone: 'Under-Eye & UV Shielding',
        observation:
          input.sleepHours === 'under-6' || needsSpfFocus
            ? 'Short rest windows and intermittent SPF can heighten dullness or uneven tone appearance over time.'
            : 'Consistent rest and daily UV protection support steady skin clarity.',
        focusLevel: (needsSpfFocus ? 'Priority Care' : 'Mild Focus') as 'Balanced' | 'Mild Focus' | 'Priority Care',
      },
    ];

    const possibleConcerns: string[] = [];
    if (isDryContext || input.profile.concerns.includes('hydration')) {
      possibleConcerns.push('Surface dehydration & barrier tightness');
    }
    if (needsSpfFocus || input.profile.concerns.includes('uneven-tone')) {
      possibleConcerns.push('UV-linked tone unevenness');
    }
    if (input.profile.concerns.includes('redness') || input.profile.sensitivities.length > 0) {
      possibleConcerns.push('Sensitivity to fragrance or stacked actives');
    }
    if (possibleConcerns.length === 0) {
      possibleConcerns.push('Preventive barrier maintenance & daily luminosity');
    }

    return {
      id: `demo-${Date.now()}`,
      createdAt: new Date().toISOString(),
      sourceLabel: input.sourceLabel,
      isDemonstration: true,
      summary: `Demonstration review combining ${resolutionNote} photo lighting cues with your ${input.profile.skinType} skin profile (${input.climate} climate). This is an educational preview, not a medical or dermatological diagnosis.`,
      observations,
      possibleConcerns,
      confidenceNote: `${lightingCaveat} Single-photograph previews cannot measure subsurface hydration, dermal health, or medical skin conditions.`,
      educationalGuidance: [
        'Keep morning cleansing gentle and layer hydrating serums while skin remains slightly damp.',
        needsSpfFocus
          ? 'Prioritize broad-spectrum SPF 30–50 every morning as the highest-impact daily habit.'
          : 'Maintain your daily SPF habit and cleanse thoroughly each evening before applying treatments.',
        'Introduce any new active ingredient slowly (2–3 nights weekly) and consult a licensed dermatologist for persistent skin conditions.',
      ],
      recommendedIngredients: isDryContext
        ? ['Multi-Weight Hyaluronic Acid', 'Ceramides NP/AP', 'Panthenol (B5)', 'Squalane']
        : ['5% Niacinamide', 'Copper Tripeptides', 'Centella Asiatica', 'Non-Nano Zinc Oxide'],
    };
  }
}

export const skinAnalysisService: ISkinAnalysisProvider = new DemoSkinAnalysisProvider();
