import { Router } from "express";

const nutritionRouter = Router();

/**
 * GET /api/nutrition/today
 * Deterministic rule-based nutrition guidance layer
 */
nutritionRouter.get("/today", (req, res) => {
  const phase = String(req.query.phase ?? "UNKNOWN");
  const lowAppetite = String(req.query.lowAppetite ?? "false") === "true";
  const tasteChanges = String(req.query.tasteChanges ?? "false") === "true";

  const rules: string[] = [];
  const tips: string[] = [];

  if (phase === "IN_TREATMENT") {
    rules.push("phase_in_treatment_base");
    tips.push("Small, frequent meals often work better than large portions.");
  } else if (phase === "POST_TREATMENT") {
    rules.push("phase_post_treatment_base");
    tips.push("Build consistency: protein + fibre + colour at most meals.");
  } else {
    rules.push("phase_unknown_base");
    tips.push("Add 1 protein + 1 colour to whatever you're already eating.");
  }

  if (lowAppetite) {
    rules.push("symptom_low_appetite");
    tips.push("Choose calorie-dense, low-volume foods (yoghurt, nut butter, smoothies).");
    tips.push("Prioritise protein first — a few mouthfuls counts.");
  }

  if (tasteChanges) {
    rules.push("symptom_taste_changes");
    tips.push("Cold foods, sharper flavours (lemon/vinegar), and varied textures can help.");
    tips.push("Plastic cutlery may reduce metallic taste.");
  }

  return res.json({
    ok: true,
    engine: "nutrition_v1",
    date: new Date().toISOString().slice(0, 10),
    inputs: { phase, lowAppetite, tasteChanges },
    rulesFired: rules,
    today: {
      coloursTarget: 5,
      proteinAnchor: "Aim for protein at 2–3 eating moments (symptom-led).",
      tips,
      tracker: {
        meals: [
          { meal: "breakfast", hadProtein: null, colours: [] },
          { meal: "lunch", hadProtein: null, colours: [] },
          { meal: "dinner", hadProtein: null, colours: [] },
          { meal: "snacks", hadProtein: null, colours: [] },
        ],
      },
    },
  });
});

export default nutritionRouter;
