import React, { useState } from 'react';

interface Skill {
  name: string;
  level: number; // 1-5
  category: string;
}

const skills: Skill[] = [
  // Design Skills
  { name: 'UI Design', level: 5, category: 'Design' },
  { name: 'UX Design', level: 5, category: 'Design' },
  { name: 'Figma', level: 5, category: 'Design' },
  { name: 'Branding', level: 4, category: 'Design' },
  { name: 'Adobe Suite', level: 4, category: 'Design' },

  // Frontend Skills
  { name: 'React', level: 5, category: 'Frontend' },
  { name: 'TypeScript', level: 5, category: 'Frontend' },
  { name: 'Tailwind CSS', level: 5, category: 'Frontend' },
  { name: 'Next.js', level: 5, category: 'Frontend' },
  { name: 'JavaScript', level: 5, category: 'Frontend' },

  // Backend Skills
  { name: 'Node.js', level: 4, category: 'Backend' },
  { name: 'Express', level: 4, category: 'Backend' },
  { name: 'PostgreSQL', level: 4, category: 'Backend' },
  { name: 'APIs', level: 5, category: 'Backend' },
  { name: 'Firebase', level: 3, category: 'Backend' },

  // Other Skills
  { name: 'SEO', level: 4, category: 'Other' },
  { name: 'Performance', level: 4, category: 'Other' },
  { name: 'Accessibility', level: 4, category: 'Other' }
];

const categories = Array.from(new Set(skills.map(s => s.category)));

const getLevelColor = (level: number) => {
  if (level === 5) return 'bg-green-500';
  if (level === 4) return 'bg-blue-500';
  if (level === 3) return 'bg-yellow-500';
  return 'bg-gray-400';
};

const getLevelLabel = (level: number) => {
  const labels = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced', 4: 'Expert', 5: 'Master' };
  return labels[level as keyof typeof labels];
};

export default function SkillsMatrix() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredSkills = selectedCategory
    ? skills.filter(s => s.category === selectedCategory)
    : skills;

  return (
    <div className="w-full">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
            selectedCategory === null
              ? 'bg-primary text-primary-foreground'
              : 'bg-card border border-border text-foreground hover:border-primary/50'
          }`}
        >
          All Skills
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
              selectedCategory === category
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-foreground hover:border-primary/50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSkills.map(skill => (
          <div
            key={skill.name}
            className="bg-card rounded-lg p-4 border border-border hover:shadow-lg hover:border-primary/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">{skill.name}</h3>
              <span className="text-xs bg-blue-100 text-primary px-2 py-1 rounded">
                {getLevelLabel(skill.level)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full ${getLevelColor(skill.level)} transition-all duration-500`}
                style={{ width: `${(skill.level / 5) * 100}%` }}
              />
            </div>

            {/* Level Indicators */}
            <div className="flex gap-1 mt-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${
                    i < skill.level ? getLevelColor(skill.level) : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <p className="text-sm font-semibold text-foreground mb-3">Proficiency Levels:</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[5, 4, 3, 2, 1].map(level => (
            <div key={level} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getLevelColor(level)}`} />
              <span className="text-xs text-muted-foreground">{getLevelLabel(level)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
