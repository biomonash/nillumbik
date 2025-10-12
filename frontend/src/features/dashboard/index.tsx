import React, { useEffect, useState } from "react";
import { StatsCard } from "./components/StatsCard";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import styles from "./Dashboard.module.scss";
import {
  getDashboardStats,
  type DashboardStatsResponse,
} from "../../apis/stats.api";
import { toPercent } from "../../lib/utils";
import { BarChart } from "./components/charts/BarChart";
import { LineChart } from "./components/charts/LineChart";
import { PieChart } from "./components/charts/PieChart";

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);

  useEffect(() => {
    getDashboardStats({
      from: new Date("2025-01-01"),
    }).then(setStats);
  }, []);

  // Icon placeholder
  const IconPlaceholder = ({ label }: { label: string }) => (
    <span className={styles.iconPlaceholder} title={label} aria-label={label}>
      {label[0]}
    </span>
  );

  // Data visualization placeholder
  const DataVisualizationPlaceholder = () => (
    <div className={styles.dataVisualizationPlaceholder}>
      Data Visualization Coming Soon
    </div>
  );

  const detectionItems = [
    {
      species: "Powerful Owl",
      location: "Eltham Lower Park",
      time: "2 hours ago",
      status: "rare",
    },
    {
      species: "Echidna",
      location: "Diamond Creek Trail",
      time: "4 hours ago",
      status: "native",
    },
    {
      species: "Sugar Glider",
      location: "Kangaroo Ground",
      time: "6 hours ago",
      status: "native",
    },
    {
      species: "European Starling",
      location: "Hurstbridge",
      time: "8 hours ago",
      status: "invasive",
    },
  ];

  return (
    <div className={styles.dashboardContainer}>
      {/* Welcome Section */}
      <div className={styles.welcomeSection}>
        <div>
          <h1 className={styles.title}>Ecological Monitoring Dashboard</h1>
          <p className={styles.subtitle}>
            Real-time environmental data from across Nillumbik Shire
          </p>
        </div>
        <div>
          <Badge variant="secondary" className={styles.liveBadge}>
            <IconPlaceholder label="Live" />
            Live Monitoring
          </Badge>
        </div>
      </div>

      {/* Key Statistics */}
      {stats !== null ? (
        <div className={styles.statsGrid}>
          <StatsCard
            title="Total Species Detected"
            value={stats.speciesCount}
            subtitle="Across all monitored areas"
            icon={<span className="statsCardIcon">🔔</span>}
            trend={{ value: 12, label: "vs last month" }}
            color="forest"
          />
          <StatsCard
            title="Active Monitoring Sites"
            value={stats.sitesCount}
            subtitle="Continuous data collection"
            icon={<span className="statsCardIcon">🌁</span>}
            trend={{ value: 12, label: "vs last month" }}
            color="primary"
          />
          <StatsCard
            title="Detection Events"
            value={stats.observationCount}
            subtitle="Total recorded observations"
            icon={<span className="statsCardIcon">🔍</span>}
            trend={{ value: 8, label: "vs last month" }}
            color="accent"
          />
          <StatsCard
            title="Native Species"
            value={toPercent(stats.nativeSpeciesCount / stats.speciesCount)}
            subtitle="Of all detected species"
            icon={<span className="statsCardIcon">🦜</span>}
            trend={{ value: 12, label: "vs last month" }}
            color="secondary"
          />
        </div>
      ) : (
        <p>Loading</p>
      )}

      {/* Data Visualizations */}
      <div className={styles.dataVisualizationGrid}>
      <Card>
        <CardHeader>
          <CardTitle>Species by Year</CardTitle>
          <CardDescription>Distribution across years</CardDescription>
        </CardHeader>
        <CardContent><BarChart /></CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Native vs Invasive Trends</CardTitle>
          <CardDescription>Annual variation</CardDescription>
        </CardHeader>
        <CardContent><LineChart /></CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Species Composition</CardTitle>
          <CardDescription>Native, Invasive, Rare</CardDescription>
        </CardHeader>
        <CardContent><PieChart /></CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>Habitat or Location breakdown</CardDescription>
        </CardHeader>
        <CardContent><DataVisualizationPlaceholder /></CardContent>
      </Card>
    </div>

      {/* Recent Activity & Map */}
      <div className={styles.recentActivityGrid}>
        {/* Left: Map Placeholder */}
        <div className={styles.mapPlaceholder}>
          <Card>
            <CardHeader>
              <CardTitle>Interactive Map</CardTitle>
              <CardDescription>Placeholder for the map</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={styles.mapFrame}>Map Placeholder</div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Recent Detection Highlights */}
        <div className={styles.detectionHighlights}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Detection Highlights</CardTitle>
              <CardDescription>
                Notable species observations from the past 48 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={styles.detectionList}>
                {detectionItems.map((item, index) => (
                  <div key={index} className={styles.detectionItem}>
                    <div className={styles.detectionInfo}>
                      <div
                        className={`${styles.statusDot} ${
                          item.status === "rare"
                            ? styles.statusRare
                            : item.status === "native"
                              ? styles.statusNative
                              : styles.statusInvasive
                        }`}
                      />
                      <div>
                        <p className={styles.speciesName}>{item.species}</p>
                        <p className={styles.speciesLocation}>
                          {item.location}
                        </p>
                      </div>
                    </div>
                    <div className={styles.detectionTime}>
                      <Badge
                        variant={
                          item.status === "invasive"
                            ? "destructive"
                            : "secondary"
                        }
                        className={styles.detectionBadge}
                      >
                        {item.status}
                      </Badge>
                      <p className={styles.timeText}>{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and report generation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={styles.quickActionsGrid}>
            {["Map", "Tree", "Trnd", "Data"].map((label) => (
              <Button
                key={label}
                variant="outline"
                className={styles.quickActionButton}
              >
                <IconPlaceholder label={label} />
                <span className={styles.quickActionText}>
                  {label === "Map"
                    ? "View Map"
                    : label === "Tree"
                      ? "Species Report"
                      : label === "Trnd"
                        ? "Analytics"
                        : "Data Export"}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
