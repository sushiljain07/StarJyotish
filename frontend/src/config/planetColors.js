// frontend/src/config/planetColors.js
//
// Previously, PLANET_COLORS was defined independently in 9 different chart
// components, and LORD_COLORS in 2 more — and they had drifted out of sync
// with each other (Mars, Saturn, Ketu, and Uranus each rendered in 2-3
// different colors depending on which tab you were looking at). One canonical
// source now; every consumer imports from here instead of defining its own.
//
// PLANET_COLORS canonical source: KundliChart.jsx / SouthIndiaChart.jsx /
// TransitPanel.jsx, which already agreed with each other and cover the
// most-viewed tabs (the default North Indian chart, the Kundli result
// dashboard, and the transit panel).
//
// LORD_COLORS canonical source: PlanetTable.jsx, which is part of the
// default "Kundli" tab everyone sees, versus KPChart.jsx which only renders
// once someone explicitly toggles to the KP chart style — same
// "most-viewed surface wins" reasoning applied to the smaller LORD_COLORS
// split.
export const PLANET_COLORS = {
  Sun: '#E53E3E', Moon: '#E53E3E', Mars: '#E53E3E', Rahu: '#E53E3E',
  Saturn: '#2563EB', Jupiter: '#2563EB',
  Mercury: '#16A34A', Venus: '#16A34A',
  Ketu: '#8B0000',
  Neptune: '#7C3AED', Uranus: '#7C3AED', Pluto: '#374151',
}

export const LORD_COLORS = {
  Sun: '#E53E3E', Moon: '#7B61FF', Mars: '#CC2200', Rahu: '#8B0000',
  Saturn: '#1E40AF', Jupiter: '#2563EB', Mercury: '#16A34A', Venus: '#E91E8C', Ketu: '#5B21B6',
}
