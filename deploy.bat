@echo off
echo ========================================
echo   DAX AI Data Collection - Docker Deploy
echo ========================================
echo.

:: Set variables
set REPO_URL=git@github-profile2:Codehive-Inc/dax-ai-data-collection.git
set PROJECT_DIR=dax-ai-data-collection
set TIMESTAMP=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

echo [%time%] Starting deployment process...
echo.

:: Check if Docker is running
echo [%time%] Checking Docker status...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not running!
    echo Please install Docker Desktop and make sure it's running.
    pause
    exit /b 1
)
echo ✓ Docker is available
echo.

:: Check if Docker Compose is available
echo [%time%] Checking Docker Compose...
docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker Compose is not available!
    echo Please make sure Docker Desktop includes Docker Compose.
    pause
    exit /b 1
)
echo ✓ Docker Compose is available
echo.

:: Stop existing containers if running
echo [%time%] Stopping existing containers...
docker compose down --remove-orphans
echo.

:: Clean up old images (optional)
echo [%time%] Cleaning up old images...
docker image prune -f
echo.

:: Check if project directory exists
if exist "%PROJECT_DIR%" (
    echo [%time%] Project directory exists, updating code...
    cd "%PROJECT_DIR%"
    
    :: Pull latest changes
    echo [%time%] Pulling latest changes from main branch...
    git fetch origin
    git reset --hard origin/main
    
    :: Update submodules
    echo [%time%] Updating submodules...
    git submodule update --init --recursive --remote
    
    :: Switch to the correct branch in submodule
    cd microstrategy-dax-api
    git checkout 02_dax-chat-endpoints
    git pull origin 02_dax-chat-endpoints
    cd ..
    
) else (
    echo [%time%] Cloning repository...
    git clone --recursive %REPO_URL%
    if %errorlevel% neq 0 (
        echo ERROR: Failed to clone repository!
        echo Please check your SSH keys and repository access.
        pause
        exit /b 1
    )
    cd "%PROJECT_DIR%"
    
    :: Ensure submodule is on correct branch
    cd microstrategy-dax-api
    git checkout 02_dax-chat-endpoints
    cd ..
)

echo ✓ Code updated successfully
echo.

:: Create necessary directories
echo [%time%] Creating necessary directories...
if not exist "microstrategy-dax-api\data" mkdir "microstrategy-dax-api\data"
if not exist "microstrategy-dax-api\data\examples" mkdir "microstrategy-dax-api\data\examples"
if not exist "microstrategy-dax-api\data\backups" mkdir "microstrategy-dax-api\data\backups"
if not exist "microstrategy-dax-api\logs" mkdir "microstrategy-dax-api\logs"
echo ✓ Directories created
echo.

:: Build and start containers
echo [%time%] Building Docker images...
docker compose build --no-cache
if %errorlevel% neq 0 (
    echo ERROR: Failed to build Docker images!
    pause
    exit /b 1
)
echo ✓ Images built successfully
echo.

echo [%time%] Starting containers...
docker compose up -d
if %errorlevel% neq 0 (
    echo ERROR: Failed to start containers!
    pause
    exit /b 1
)
echo ✓ Containers started successfully
echo.

:: Wait for services to be ready
echo [%time%] Waiting for services to be ready...
timeout /t 10 /nobreak >nul

:: Check service health
echo [%time%] Checking service health...
echo.

:: Check MicroStrategy DAX API
echo Checking MicroStrategy DAX API...
curl -s http://localhost:8080/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ MicroStrategy DAX API is healthy
) else (
    echo ⚠ MicroStrategy DAX API might still be starting...
)

:: Check React Frontend
echo Checking React Frontend...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ React Frontend is accessible
) else (
    echo ⚠ React Frontend might still be starting...
)

echo.
echo ========================================
echo   DEPLOYMENT COMPLETED!
echo ========================================
echo.
echo 🌐 Services are now running:
echo   • React Frontend:        http://localhost:3000
echo   • MicroStrategy DAX API: http://localhost:8080
echo   • API Documentation:     http://localhost:8080/docs
echo.
echo 📊 Test the application:
echo   • Cognos to Power BI:      http://localhost:3000/cognos-to-pbi
echo   • MicroStrategy to Power BI: http://localhost:3000/microstrategy-to-pbi
echo   • Tableau to Power BI:     http://localhost:3000/tableau-to-pbi
echo.
echo 🔧 Useful commands:
echo   • View logs:          docker compose logs -f
echo   • Stop services:      docker compose down
echo   • Restart services:   docker compose restart
echo   • View containers:    docker compose ps
echo.
echo Deployment completed at: %date% %time%
echo.

:: Ask if user wants to view logs
set /p view_logs="Would you like to view the logs? (y/n): "
if /i "%view_logs%"=="y" (
    echo.
    echo Opening logs... (Press Ctrl+C to exit)
    docker compose logs -f
)

pause

