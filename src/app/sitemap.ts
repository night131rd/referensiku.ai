    import { MetadataRoute } from 'next'

    export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
        url: 'https://www.jurnalgpt.app',
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
        },
        {
        url: 'https://www.jurnalgpt.app/search',
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
        },
    ]
    }
