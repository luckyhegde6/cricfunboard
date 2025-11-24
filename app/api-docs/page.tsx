'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { useEffect, useState } from 'react';

export default function ApiDocsPage() {
    const [spec, setSpec] = useState<string | null>(null);

    useEffect(() => {
        fetch('/openapi.yaml')
            .then((res) => res.text())
            .then((text) => {
                // Parse YAML to JSON (SwaggerUI can handle both)
                setSpec(text);
            })
            .catch((err) => console.error('Failed to load OpenAPI spec:', err));
    }, []);

    if (!spec) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading API Documentation...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">CricFunBoard API Documentation</h1>
            <SwaggerUI spec={spec} />
        </div>
    );
}
