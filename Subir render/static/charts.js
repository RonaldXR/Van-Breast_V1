"use strict";

(() => {
  const ChartLibrary = window.Chart;
  if (!ChartLibrary) {
    throw new Error("Chart.js no está disponible.");
  }

  const instances = new Map();
  const colorCache = new Map();
  let colorProbe = null;

  function themeColor(variable, fallback) {
    const declared =
      window
        .getComputedStyle(document.documentElement)
        .getPropertyValue(variable)
        .trim() || fallback;
    if (colorCache.has(declared)) return colorCache.get(declared);

    if (!colorProbe) {
      colorProbe = document.createElement("span");
      colorProbe.hidden = true;
      colorProbe.setAttribute("aria-hidden", "true");
      document.body.appendChild(colorProbe);
    }
    colorProbe.style.color = declared;
    const color = window.getComputedStyle(colorProbe).color || fallback;
    colorCache.set(declared, color);
    return color;
  }

  function withAlpha(color, alpha) {
    const channels = String(color).match(/[\d.]+/g);
    if (!channels || channels.length < 3) return color;
    return `rgba(${channels[0]}, ${channels[1]}, ${channels[2]}, ${alpha})`;
  }

  function verticalGradient(canvas, color, topAlpha, bottomAlpha = 0) {
    const context = canvas.getContext("2d");
    const gradient = context.createLinearGradient(
      0,
      0,
      0,
      canvas.clientHeight || 320,
    );
    gradient.addColorStop(0, withAlpha(color, topAlpha));
    gradient.addColorStop(1, withAlpha(color, bottomAlpha));
    return gradient;
  }

  function tooltipOptions() {
    return {
      backgroundColor: withAlpha(themeColor("--ink", "#493933"), 0.94),
      bodyColor: themeColor("--surface", "#ffffff"),
      titleColor: themeColor("--surface", "#ffffff"),
      borderColor: withAlpha(themeColor("--line-strong", "#c7b9b3"), 0.8),
      borderWidth: 1,
      cornerRadius: 10,
      caretPadding: 8,
      displayColors: true,
      boxPadding: 5,
      padding: 12,
    };
  }

  function destroy(key) {
    const chart = instances.get(key);
    if (chart) chart.destroy();
    instances.delete(key);
  }

  function replace(key, canvas, configuration) {
    destroy(key);
    const chart = new ChartLibrary(canvas, configuration);
    instances.set(key, chart);
    return chart;
  }

  function elapsedLabel(point, index) {
    if (Number.isFinite(Number(point.elapsedMs))) {
      return `${(Number(point.elapsedMs) / 1000).toFixed(1)} s`;
    }
    return `${(index * 0.65).toFixed(1)} s`;
  }

  const pressureBands = {
    id: "pressureBands",
    beforeDatasetsDraw(chart) {
      const { ctx, chartArea, scales } = chart;
      if (!chartArea || !scales.y) return;
      const bands = [
        {
          minimum: 9.5,
          maximum: 13.5,
          color: themeColor("--chart-index", "#248eae"),
        },
        {
          minimum: 8.5,
          maximum: 12.5,
          color: themeColor("--chart-middle", "#d8758c"),
        },
      ];

      ctx.save();
      bands.forEach((band) => {
        const top = scales.y.getPixelForValue(band.maximum);
        const bottom = scales.y.getPixelForValue(band.minimum);
        ctx.fillStyle = withAlpha(band.color, 0.035);
        ctx.fillRect(chartArea.left, top, chartArea.width, bottom - top);
      });
      ctx.restore();
    },
  };

  function pressureOptions(compact) {
    const gridColor = themeColor("--chart-grid", "#e7dce1");
    const textColor = themeColor("--muted", "#76676d");
    return {
      responsive: true,
      maintainAspectRatio: false,
      normalized: true,
      animation: compact
        ? {
            duration: 320,
            easing: "easeOutQuart",
          }
        : false,
      interaction: {
        intersect: false,
        mode: "index",
      },
      layout: {
        padding: {
          top: compact ? 6 : 10,
          right: 8,
          bottom: 2,
          left: 2,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          ...tooltipOptions(),
          callbacks: {
            label(context) {
              return `${context.dataset.label}: ${Number(context.parsed.y).toFixed(1)} N`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          border: {
            display: false,
          },
          ticks: {
            color: textColor,
            display: compact,
            autoSkip: true,
            maxTicksLimit: 7,
            maxRotation: 0,
            font: {
              size: 10,
            },
          },
        },
        y: {
          suggestedMin: 6,
          suggestedMax: 16,
          grid: {
            color: withAlpha(gridColor, 0.72),
            drawTicks: false,
            lineWidth: 1,
          },
          border: {
            display: false,
          },
          ticks: {
            color: textColor,
            stepSize: 2,
            padding: 9,
            font: {
              size: 10,
            },
            callback(value) {
              return `${value} N`;
            },
          },
        },
      },
    };
  }

  function pressureDatasets(data, compact, canvas) {
    const indexColor = themeColor("--chart-index", "#248eae");
    const middleColor = themeColor("--chart-middle", "#d8758c");
    const surface = themeColor("--surface", "#ffffff");
    return [
      {
        label: "Índice",
        data: data.map((point) => Number(point.index)),
        borderColor: indexColor,
        backgroundColor: verticalGradient(canvas, indexColor, 0.16),
        fill: "origin",
        borderWidth: compact ? 2.2 : 2.7,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBorderWidth: 2,
        pointHoverBorderColor: surface,
        pointHoverBackgroundColor: indexColor,
        pointHitRadius: 14,
        cubicInterpolationMode: "monotone",
        tension: 0.36,
      },
      {
        label: "Medio",
        data: data.map((point) => Number(point.middle)),
        borderColor: middleColor,
        backgroundColor: verticalGradient(canvas, middleColor, 0.13),
        fill: "origin",
        borderWidth: compact ? 2.2 : 2.7,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBorderWidth: 2,
        pointHoverBorderColor: surface,
        pointHoverBackgroundColor: middleColor,
        pointHitRadius: 14,
        cubicInterpolationMode: "monotone",
        tension: 0.36,
      },
    ];
  }

  function renderPressure(key, canvas, data, { compact = false } = {}) {
    if (!canvas) return null;
    const values = Array.isArray(data) ? data : [];
    const labels = values.map(elapsedLabel);
    const existing = instances.get(key);
    const appearanceKey = [
      compact,
      themeColor("--chart-index", "#248eae"),
      themeColor("--chart-middle", "#d8758c"),
      themeColor("--surface", "#ffffff"),
      themeColor("--chart-grid", "#e7dce1"),
      themeColor("--muted", "#76676d"),
    ].join("|");

    if (existing?.canvas === canvas && existing.config.type === "line") {
      existing.data.labels = labels;
      if (existing.$appearanceKey !== appearanceKey) {
        existing.data.datasets = pressureDatasets(values, compact, canvas);
        existing.options = pressureOptions(compact);
        existing.$appearanceKey = appearanceKey;
      } else {
        existing.data.datasets[0].data = values.map((point) => Number(point.index));
        existing.data.datasets[1].data = values.map((point) => Number(point.middle));
      }
      existing.update("none");
      return existing;
    }

    const chart = replace(key, canvas, {
      type: "line",
      data: {
        labels,
        datasets: pressureDatasets(values, compact, canvas),
      },
      options: pressureOptions(compact),
      plugins: [pressureBands],
    });
    chart.$appearanceKey = appearanceKey;
    return chart;
  }

  const weeklyValueLabels = {
    id: "weeklyValueLabels",
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      ctx.save();
      ctx.fillStyle = themeColor("--weekly-text", "#493933");
      ctx.font = "700 11px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      chart.getDatasetMeta(0).data.forEach((bar, index) => {
        ctx.fillText(String(chart.data.datasets[0].data[index]), bar.x, bar.y - 7);
      });
      ctx.restore();
    },
  };

  function renderWeekly(canvas, weekly) {
    if (!canvas) return null;
    const values = Array.isArray(weekly) ? weekly : [];
    const pink = themeColor("--chart-middle", "#d8758c");
    const softPink = withAlpha(pink, 0.58);
    const peak = Math.max(...values.map((day) => Number(day.count) || 0), 0);

    return replace("weekly", canvas, {
      type: "bar",
      data: {
        labels: values.map((day) => day.label),
        datasets: [
          {
            label: "Sesiones",
            data: values.map((day) => Number(day.count) || 0),
            backgroundColor: values.map((day) =>
              Number(day.count) === peak && peak > 0 ? pink : softPink,
            ),
            hoverBackgroundColor: pink,
            borderColor: withAlpha(pink, 0.32),
            borderWidth: 1,
            borderRadius: 9,
            borderSkipped: false,
            maxBarThickness: 30,
            categoryPercentage: 0.72,
            barPercentage: 0.74,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 620,
          easing: "easeOutQuart",
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
        layout: {
          padding: {
            top: 26,
            left: 4,
            right: 4,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            ...tooltipOptions(),
            displayColors: false,
            callbacks: {
              label(context) {
                const count = Number(context.parsed.y) || 0;
                return `${count} ${count === 1 ? "sesión" : "sesiones"}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            border: {
              color: withAlpha(themeColor("--weekly-text", "#493933"), 0.28),
            },
            ticks: {
              color: themeColor("--weekly-text", "#493933"),
              font: {
                size: 11,
                weight: "600",
              },
            },
          },
          y: {
            beginAtZero: true,
            suggestedMax: Math.max(peak, 1) + 1,
            display: false,
          },
        },
      },
      plugins: [weeklyValueLabels],
    });
  }

  function renderRange(canvas, percentage) {
    if (!canvas) return null;
    const correct = Math.max(0, Math.min(100, Number(percentage) || 0));
    const indexColor = themeColor("--chart-index", "#248eae");
    const middleColor = themeColor("--chart-middle", "#d8758c");
    return replace("range", canvas, {
      type: "doughnut",
      data: {
        labels: ["Presión correcta", "Fuera del rango"],
        datasets: [
          {
            data: [correct, 100 - correct],
            backgroundColor: [indexColor, withAlpha(middleColor, 0.55)],
            hoverBackgroundColor: [indexColor, middleColor],
            borderColor: themeColor("--surface", "#ffffff"),
            borderWidth: 3,
            borderRadius: 7,
            spacing: 2,
            hoverOffset: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "74%",
        animation: {
          duration: 650,
          easing: "easeOutQuart",
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            ...tooltipOptions(),
            callbacks: {
              label(context) {
                return `${context.label}: ${context.parsed}%`;
              },
            },
          },
        },
      },
    });
  }

  function resize(key) {
    instances.get(key)?.resize();
  }

  window.VanBreastCharts = Object.freeze({
    destroy,
    renderPressure,
    renderRange,
    renderWeekly,
    resize,
  });
})();
