"use client";
import React from "react";
import "./StudentHero.css";

interface StudentHeroProps {
  title: string;
  subtitle: string;
  count?: number;
  countLabel?: string;
  filters?: Array<{ id: string; label: string; count?: number }>;
  activeFilter?: string;
  onFilterChange?: (filterId: string) => void;
  stats?: Array<{ num: number; label: string }>;
}

export default function StudentHero({
  title,
  subtitle,
  count,
  countLabel = "عنصر",
  filters,
  activeFilter,
  onFilterChange,
  stats,
}: StudentHeroProps) {
  return (
    <div className="student-hero">
      <div className="student-hero__inner">
        <div className="student-hero__text">
          <h1 className="student-hero__title">{title}</h1>
          <p className="student-hero__subtitle">{subtitle}</p>
        </div>

        {/* Count badge or stats pills */}
        {stats && stats.length > 0 ? (
          <div className="student-hero__stats">
            {stats.map((stat) => (
              <div key={stat.label} className="student-hero__stat-pill">
                <span className="student-hero__stat-num">{stat.num}</span>
                <span className="student-hero__stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        ) : count !== undefined ? (
          <span className="student-hero__count">
            {count} {countLabel}
          </span>
        ) : null}
      </div>

      {/* Filter tabs */}
      {filters && filters.length > 0 && (
        <div className="student-hero__filters">
          {filters.map((filter) => (
            <button
              key={filter.id}
              className={`student-hero__filter-pill${
                activeFilter === filter.id ? " active" : ""
              }`}
              onClick={() => onFilterChange?.(filter.id)}
            >
              {filter.label}
              {filter.count !== undefined && (
                <span className="student-hero__filter-count">{filter.count}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
