export type ClassificationResult =
  | { status: "demo"; label: string; note: string }
  | { status: "unavailable" };

export interface HealthClassifier {
  classify(filePath: string): Promise<ClassificationResult>;
}

class MockHealthClassifier implements HealthClassifier {
  async classify(): Promise<ClassificationResult> {
    return {
      status: "demo",
      label: "No visible disease indicators",
      note: "DEMO RESULT — mock classification only. No trained model is connected.",
    };
  }
}

class UnavailableClassifier implements HealthClassifier {
  async classify(): Promise<ClassificationResult> {
    return { status: "unavailable" };
  }
}

export function getHealthClassifier(): HealthClassifier {
  const mode = process.env.CLASSIFIER_ADAPTER ?? "mock";
  if (mode === "unavailable") return new UnavailableClassifier();
  return new MockHealthClassifier();
}
