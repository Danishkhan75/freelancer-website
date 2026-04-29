import React, { useState, useMemo } from 'react';

interface BlogPost {
  slug: string;
  data: {
    title: string;
    description: string;
    author: string;
    pubDate: Date;
    tags?: string[];
    image?: string;
  };
}

interface Props {
  posts: BlogPost[];
}

export default function BlogSearch({ posts }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    posts.forEach(post => {
      post.data.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [posts]);

  // Filter posts based on search query and selected tag
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch =
        post.data.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.data.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.data.author.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTag = !selectedTag || post.data.tags?.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [posts, searchQuery, selectedTag]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="w-full space-y-8">
      {/* Search Bar */}
      <div className="max-w-2xl mx-auto w-full">
        <div className="relative">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-4 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex flex-wrap gap-2 items-center justify-center">
            <span className="text-sm font-semibold text-muted-foreground">Filter by tag:</span>
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedTag === null
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-foreground hover:border-primary/50'
              }`}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedTag === tag
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-foreground hover:border-primary/50'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="text-center">
        <p className="text-muted-foreground">
          {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'} found
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      </div>

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No posts found. Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map(post => (
            <article key={post.slug} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              {post.data.image && (
                <div className="relative h-48 overflow-hidden bg-muted">
                  <img
                    src={post.data.image}
                    alt={post.data.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {post.data.tags?.map(tag => (
                      <span key={tag} className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-xl font-bold text-foreground hover:text-primary transition-colors">
                    <a href={`/blog/${post.slug}`}>
                      {post.data.title}
                    </a>
                  </h3>
                </div>

                <p className="text-muted-foreground text-sm line-clamp-3">
                  {post.data.description}
                </p>

                <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border">
                  <span>{post.data.author}</span>
                  <span>{formatDate(post.data.pubDate)}</span>
                </div>

                <a href={`/blog/${post.slug}`} className="inline-flex items-center text-primary font-semibold hover:text-primary/80 transition-colors mt-2">
                  Read More →
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
