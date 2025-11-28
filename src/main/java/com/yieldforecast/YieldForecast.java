package com.yieldforecast;

import org.json.JSONObject;
import java.io.BufferedReader;
import java.io.InputStreamReader;

public class YieldForecast {

    public static void main(String[] args) {
        try {
            System.out.println("Starting Yield Forecast Application (Hybrid Java/Python)...");

            System.out.println("Fetching data from Google Earth Engine via Python...");
            JSONObject geeData = runPythonScript();

            if (geeData.has("error")) {
                throw new RuntimeException("GEE Error: " + geeData.getString("error"));
            }

            System.out.println("GEE Data Received: " + geeData.toString(2));

            double ndvi = geeData.optDouble("NDVI", 0.0);
            System.out.println("Processing NDVI: " + ndvi);

            double predictedYield = 15.0 + (ndvi * 10);
            System.out.printf("Predicted Yield: %.2f c/ha%n", predictedYield);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static JSONObject runPythonScript() throws Exception {
        io.github.cdimascio.dotenv.Dotenv dotenv = io.github.cdimascio.dotenv.Dotenv.configure()
                .directory(".")
                .ignoreIfMissing()
                .load();

        String pythonPath = dotenv.get("PYTHON_VENV_PATH");

        ProcessBuilder pb = new ProcessBuilder(pythonPath, "src/main/python/yield_forecast.py");
        pb.environment().put("GEE_PROJECT_ID", dotenv.get("GEE_PROJECT_ID", ""));
        pb.redirectErrorStream(true);
        Process process = pb.start();

        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        StringBuilder output = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            output.append(line);
        }

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new RuntimeException("Python script failed with exit code " + exitCode + ": " + output);
        }

        return new JSONObject(output.toString());
    }
}