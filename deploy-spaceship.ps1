# Spaceship Hyperlift - Quick Deploy Script

# Build production image
echo "🏗️  Building production image..."
docker build -f Dockerfile.landing -t mehaal-ai:production .

# Test locally first
echo "🧪 Testing locally..."
docker run -d -p 3000:3000 --name mehaal-test mehaal-ai:production

echo "⏳ Waiting 10 seconds for container to start..."
Start-Sleep -Seconds 10

# Check if running
$response = try { Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 } catch { $null }

if ($response -and $response.StatusCode -eq 200) {
    echo "✅ Local test successful!"
    docker stop mehaal-test
    docker rm mehaal-test
} else {
    echo "❌ Local test failed. Check logs:"
    docker logs mehaal-test
    docker stop mehaal-test
    docker rm mehaal-test
    exit 1
}

# Tag for registry (UPDATE WITH YOUR DETAILS)
echo "🏷️  Tagging images..."
$REGISTRY = "registry.spaceship.com"
$USERNAME = "YOUR_USERNAME"  # CHANGE THIS
$VERSION = "v1.0.0"

docker tag mehaal-ai:production "$REGISTRY/$USERNAME/mehaal-ai:latest"
docker tag mehaal-ai:production "$REGISTRY/$USERNAME/mehaal-ai:$VERSION"

echo "📦 Images tagged:"
echo "  - $REGISTRY/$USERNAME/mehaal-ai:latest"
echo "  - $REGISTRY/$USERNAME/mehaal-ai:$VERSION"

echo ""
echo "🚀 Next steps:"
echo "1. Login to registry: docker login $REGISTRY"
echo "2. Push images:"
echo "   docker push $REGISTRY/$USERNAME/mehaal-ai:latest"
echo "   docker push $REGISTRY/$USERNAME/mehaal-ai:$VERSION"
echo "3. Configure in Hyperlift Manager:"
echo "   - Image: $REGISTRY/$USERNAME/mehaal-ai:latest"
echo "   - Port: 3000"
echo "   - Environment: See README-SPACESHIP.md"
echo ""
echo "✨ Build complete!"
