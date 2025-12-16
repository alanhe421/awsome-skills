#!/usr/bin/env python3
"""
WeChat Mini Program Documentation Search Script

Searches through the official WeChat Mini Program documentation CSV file
and returns relevant results based on keyword matching.

Usage:
    python search_docs.py <query> [limit]

Examples:
    python search_docs.py "wx.request" 5
    python search_docs.py "小程序生命周期" 3
"""

import sys
import csv
import json
from pathlib import Path
from typing import List, Dict, Any


def load_docs(csv_path: str) -> List[Dict[str, str]]:
    """Load documentation from CSV file."""
    docs = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            docs.append(row)
    return docs


def calculate_relevance(doc: Dict[str, str], query: str) -> float:
    """
    Calculate relevance score for a document based on query.

    Scoring strategy:
    - Exact match in content: high score
    - Match in URL/title: medium-high score
    - Partial match: lower score
    - Case-insensitive matching
    """
    query_lower = query.lower()
    score = 0.0

    # Check URL (toc field) - this often contains the page title
    toc = doc.get('toc', '').lower()
    if query_lower in toc:
        score += 10.0

    # Check content
    content = doc.get('content', '').lower()
    if query_lower in content:
        # Count occurrences
        occurrences = content.count(query_lower)
        score += min(occurrences * 2, 20.0)  # Cap at 20 points

        # Bonus if query appears early in content
        first_occurrence = content.find(query_lower)
        if first_occurrence < 200:
            score += 5.0

    # Check navigation path
    nav = doc.get('nav', '').lower()
    if query_lower in nav:
        score += 3.0

    return score


def search_docs(docs: List[Dict[str, str]], query: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Search documentation and return top results.

    Args:
        docs: List of document dictionaries
        query: Search query string
        limit: Maximum number of results to return

    Returns:
        List of matching documents with relevance scores
    """
    results = []

    for doc in docs:
        score = calculate_relevance(doc, query)
        if score > 0:
            # Extract key information
            result = {
                'url': doc.get('toc', ''),
                'nav': doc.get('nav', ''),
                'content': doc.get('content', ''),
                'score': score
            }
            results.append(result)

    # Sort by relevance score (descending)
    results.sort(key=lambda x: x['score'], reverse=True)

    # Return top results
    return results[:limit]


def format_result(result: Dict[str, Any], index: int) -> str:
    """Format a single search result for display."""
    content = result['content']

    # Extract title from content (usually the first # heading)
    lines = content.split('\n')
    title = ''
    for line in lines:
        line = line.strip()
        if line.startswith('#'):
            title = line.lstrip('#').strip()
            break

    if not title:
        # Fallback: use URL as title
        title = result['url'].split('/')[-1].replace('.html', '')

    # Create content preview (first 200 chars)
    preview = content[:200].replace('\n', ' ').strip()
    if len(content) > 200:
        preview += '...'

    # Format output
    output = f"\n{'='*80}\n"
    output += f"结果 #{index + 1} (相关度: {result['score']:.1f})\n"
    output += f"{'='*80}\n"
    output += f"标题: {title}\n"
    output += f"链接: {result['url']}\n"
    output += f"导航: {result['nav']}\n"
    output += f"\n内容预览:\n{preview}\n"

    return output


def main():
    """Main entry point for the script."""
    if len(sys.argv) < 2:
        print("Usage: python search_docs.py <query> [limit]")
        print("\nExamples:")
        print('  python search_docs.py "wx.request" 5')
        print('  python search_docs.py "小程序生命周期" 3')
        sys.exit(1)

    query = sys.argv[1]
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else 5

    # Get the script directory
    script_dir = Path(__file__).parent
    skill_dir = script_dir.parent
    csv_path = skill_dir / 'references' / 'wechat-mp-docs.csv'

    if not csv_path.exists():
        print(f"Error: Documentation file not found at {csv_path}")
        sys.exit(1)

    print(f"正在搜索: \"{query}\"")
    print(f"最多返回 {limit} 个结果\n")

    # Load and search
    docs = load_docs(str(csv_path))
    print(f"已加载 {len(docs)} 篇文档")

    results = search_docs(docs, query, limit)

    if not results:
        print(f"\n未找到与 \"{query}\" 相关的文档")
        return

    print(f"\n找到 {len(results)} 个相关结果:")

    # Display results
    for i, result in enumerate(results):
        print(format_result(result, i))

    # Output JSON for programmatic access
    json_output = {
        'query': query,
        'total_results': len(results),
        'results': [
            {
                'title': result['content'].split('\n')[0].lstrip('#').strip() if result['content'] else '',
                'url': result['url'],
                'score': result['score'],
                'preview': result['content'][:200]
            }
            for result in results
        ]
    }

    # Save JSON output to temp file
    json_path = skill_dir / 'last_search.json'
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(json_output, f, ensure_ascii=False, indent=2)

    print(f"\n详细结果已保存到: {json_path}")


if __name__ == '__main__':
    main()
