import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';

interface Project {
  title: string;
  description: string;
  image: string;
  tags: string[];
}

interface PortfolioFilterProps {
  projects: Project[];
}

export default function PortfolioFilter({ projects }: PortfolioFilterProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get all unique tags
  const allTags = useMemo(
    () => Array.from(new Set(projects.flatMap((p) => p.tags))),
    [projects]
  );

  // Filter projects
  const filteredProjects = useMemo(() => {
    if (selectedTags.length === 0) return projects;
    return projects.filter((project) =>
      selectedTags.some((tag) => project.tags.includes(tag))
    );
  }, [projects, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
  };

  return (
    <div className="space-y-8">
      {/* Filter Tags */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Filter by Category</h3>
          {selectedTags.length > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                selectedTags.includes(tag)
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/30 rounded-full text-sm text-primary"
              >
                {tag}
                <button
                  onClick={() => toggleTag(tag)}
                  className="hover:opacity-70 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredProjects.length} of {projects.length} projects
      </p>

      {/* Filtered Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project, idx) => (
            <div
              key={idx}
              className="group bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative h-48 overflow-hidden bg-muted">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 space-y-3">
                <h3 className="font-semibold text-foreground text-lg">{project.title}</h3>
                <p className="text-sm text-muted-foreground">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No projects found with selected filters.</p>
            <button
              onClick={clearFilters}
              className="mt-4 text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
