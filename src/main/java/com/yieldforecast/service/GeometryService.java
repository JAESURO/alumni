package com.yieldforecast.service;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GeometryService {

    public boolean isPointInPolygon(double latitude, double longitude, JSONObject geometry) {
        if (geometry == null) {
            return false;
        }

        String type = geometry.optString("type", "");

        if ("Polygon".equals(type)) {
            JSONArray coordinates = geometry.getJSONArray("coordinates");
            if (coordinates.length() > 0) {
                JSONArray ring = coordinates.getJSONArray(0);
                return pointInPolygonRing(latitude, longitude, ring);
            }
        } else if ("Point".equals(type)) {
            JSONArray coords = geometry.getJSONArray("coordinates");
            if (coords.length() >= 2) {
                double pointLat = coords.getDouble(1);
                double pointLng = coords.getDouble(0);
                double distance = haversineDistance(latitude, longitude, pointLat, pointLng);
                return distance < 5.0;
            }
        }

        return false;
    }

    private boolean pointInPolygonRing(double lat, double lng, JSONArray ring) {
        boolean inside = false;
        int n = ring.length();

        for (int i = 0, j = n - 1; i < n; j = i++) {
            double latI = ring.getJSONArray(i).getDouble(1);
            double lngI = ring.getJSONArray(i).getDouble(0);
            double latJ = ring.getJSONArray(j).getDouble(1);
            double lngJ = ring.getJSONArray(j).getDouble(0);

            boolean intersect = ((latI > lat) != (latJ > lat)) &&
                    (lng < (lngJ - lngI) * (lat - latI) / (latJ - latI) + lngI);

            if (intersect) {
                inside = !inside;
            }
        }

        return inside;
    }

    private double haversineDistance(double lat1, double lng1, double lat2, double lng2) {
        final int R = 6371;

        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLng / 2) * Math.sin(dLng / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }
}