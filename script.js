       const form = document.getElementById("bmi-form");
        const heightRange = document.getElementById("height-range");
        const heightValue = document.getElementById("height-value");
        const weightRange = document.getElementById("weight-range");
        const weightValue = document.getElementById("weight-value");
        const unitButtons = document.querySelectorAll("[data-unit]");
        const genderButtons = document.querySelectorAll(".gender-switch button");
        let unitSystem = "metric";

        function syncFromRange(range, number) {
            number.value = range.value;
        }

        function syncFromNumber(number, range) {
            const value = Number(number.value);
            if (number.value !== "" && Number.isFinite(value)) {
                range.value = Math.min(Number(range.max), Math.max(Number(range.min), value));
            }
        }

        heightRange.addEventListener("input", () => syncFromRange(heightRange, heightValue));
        heightValue.addEventListener("input", () => syncFromNumber(heightValue, heightRange));
        weightRange.addEventListener("input", () => syncFromRange(weightRange, weightValue));
        weightValue.addEventListener("input", () => syncFromNumber(weightValue, weightRange));

        unitButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const nextSystem = button.dataset.unit;
                if (nextSystem === unitSystem) return;

                if (nextSystem === "imperial") {
                    heightValue.value = String(Math.round(Number(heightValue.value) / 2.54));
                    weightValue.value = String(Math.round(Number(weightValue.value) * 2.20462));
                    heightRange.min = "47";
                    heightRange.max = "87";
                    heightRange.value = heightValue.value;
                    weightRange.min = "55";
                    weightRange.max = "550";
                    weightRange.value = weightValue.value;
                    heightValue.min = "47";
                    heightValue.max = "87";
                    weightValue.min = "55";
                    weightValue.max = "550";
                    document.getElementById("height-unit").textContent = "in";
                    document.getElementById("weight-unit").textContent = "lb";
                } else {
                    heightValue.value = String(Math.round(Number(heightValue.value) * 2.54));
                    weightValue.value = String(Math.round(Number(weightValue.value) / 2.20462));
                    heightRange.min = "120";
                    heightRange.max = "220";
                    heightRange.value = heightValue.value;
                    weightRange.min = "25";
                    weightRange.max = "250";
                    weightRange.value = weightValue.value;
                    heightValue.min = "120";
                    heightValue.max = "220";
                    weightValue.min = "25";
                    weightValue.max = "250";
                    document.getElementById("height-unit").textContent = "cm";
                    document.getElementById("weight-unit").textContent = "kg";
                }

                unitSystem = nextSystem;
                unitButtons.forEach((unitButton) => {
                    unitButton.setAttribute("aria-pressed", String(unitButton === button));
                });
                document.getElementById("detail-bmi").textContent = "—";
                document.getElementById("bmi-number").textContent = "—";
                document.getElementById("status").textContent = "ENTER YOUR MEASUREMENTS";
                document.getElementById("scale-marker").hidden = true;
            });
        });

        genderButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const isSelected = button.getAttribute("aria-pressed") === "true";
                genderButtons.forEach((genderButton) => genderButton.setAttribute("aria-pressed", "false"));
                if (!isSelected) button.setAttribute("aria-pressed", "true");
            });
        });

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            if (!form.reportValidity()) return;

            const enteredHeight = Number(heightValue.value);
            const enteredWeight = Number(weightValue.value);
            const heightInMeters = unitSystem === "metric" ? enteredHeight / 100 : enteredHeight * 0.0254;
            const weightInKg = unitSystem === "metric" ? enteredWeight : enteredWeight / 2.20462;
            const bmi = weightInKg / (heightInMeters * heightInMeters);

            if (!Number.isFinite(bmi) || bmi <= 0) {
                form.reportValidity();
                return;
            }

            let category;
            let risk;
            if (bmi < 18.5) {
                category = "Underweight";
                risk = "Possible nutritional risk";
            } else if (bmi < 25) {
                category = "Normal";
                risk = "Minimal health risk";
            } else if (bmi < 30) {
                category = "Overweight";
                risk = "Increased health risk";
            } else {
                category = "Obesity";
                risk = "High health risk";
            }

            const roundedBmi = bmi.toFixed(1);
            const minWeightKg = 18.5 * heightInMeters * heightInMeters;
            const maxWeightKg = 24.9 * heightInMeters * heightInMeters;
            const recommendedWeight = unitSystem === "metric"
                ? `${minWeightKg.toFixed(0)}–${maxWeightKg.toFixed(0)} kg`
                : `${(minWeightKg * 2.20462).toFixed(0)}–${(maxWeightKg * 2.20462).toFixed(0)} lb`;

            document.getElementById("bmi-number").textContent = roundedBmi;
            document.getElementById("status").textContent = `STATUS: ${category.toUpperCase()}`;
            document.getElementById("status").style.color = bmi < 18.5 ? "#75bfe4"
                : bmi < 25 ? "#8cc8ac" : bmi < 30 ? "#e5bf4c" : "#e67f7f";
            document.getElementById("detail-bmi").textContent = roundedBmi;
            document.getElementById("detail-class").textContent = `${category} (${bmi < 18.5 ? "<18.5" : bmi < 25 ? "18.5–24.9" : bmi < 30 ? "25–29.9" : "≥30"} kg/m²)`;
            document.getElementById("detail-risk").textContent = risk;
            document.getElementById("detail-weight").textContent = recommendedWeight;

            const gaugeRatio = Math.min(bmi, 40) / 40;
            document.getElementById("gauge-progress").style.strokeDashoffset = String(314.16 * (1 - gaugeRatio));
            document.getElementById("gauge-needle").style.transform = `rotate(${-90 + gaugeRatio * 180}deg)`;
            const scalePosition = bmi < 18.5
                ? bmi / 18.5 * 27
                : bmi < 25
                    ? 27 + (bmi - 18.5) / 6.5 * 27
                    : bmi < 30
                        ? 54 + (bmi - 25) / 5 * 23
                        : Math.min(100, 77 + (bmi - 30) / 10 * 23);
            const marker = document.getElementById("scale-marker");
            marker.textContent = roundedBmi;
            marker.style.left = `${scalePosition}%`;
            marker.hidden = false;
        });
