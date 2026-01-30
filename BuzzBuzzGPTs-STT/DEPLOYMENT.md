# Production Deployment Guide

## Prerequisites

- Python 3.8 or higher
- Windows OS (for soundcard loopback support)
- CUDA-capable GPU (optional, for better performance)

## Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd BuzzBuzzGPTs-STT
```

### 2. Create Virtual Environment

```bash
python -m venv venv
venv\Scripts\activate  # Windows
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configuration

Copy the example environment file:

```bash
copy .env.example .env
```

Edit `.env` to configure your settings:

- `LOG_LEVEL`: Set logging level (DEBUG, INFO, WARNING, ERROR)
- `WHISPER_MODEL`: Choose model size (tiny.en, base, small, medium, large)
- `USE_GPU`: Enable/disable GPU acceleration
- `AUDIO_DEVICE`: Specify audio device (leave empty for default)

### 5. Run Application

```bash
python main.py
```

## Production Deployment

### Windows Service

To run as a Windows service, create a service wrapper using NSSM:

1. Download NSSM from https://nssm.cc/
2. Install service:

```bash
nssm install BuzzBuzzSTT "C:\path\to\venv\Scripts\python.exe" "C:\path\to\main.py"
nssm set BuzzBuzzSTT AppDirectory "C:\path\to\BuzzBuzzGPTs-STT"
nssm start BuzzBuzzSTT
```

### Docker Deployment

Build the Docker image:

```bash
docker build -t buzzbuzz-stt .
```

Run the container:

```bash
docker run -d --name buzzbuzz-stt \
  -v $(pwd)/logs:/app/logs \
  -v $(pwd)/.env:/app/.env \
  buzzbuzz-stt
```

## Monitoring

### Health Checks

The application includes built-in health monitoring. Check logs in the `logs/` directory:

- `stt_app.log`: General application logs
- `errors.log`: Error-specific logs

### Metrics

If `ENABLE_METRICS=true`, the application will log performance metrics every 60 seconds (configurable via `METRICS_INTERVAL`).

## Troubleshooting

### No Audio Detected

1. List available devices:
   ```bash
   python main.py --list-devices
   ```

2. Specify device in `.env`:
   ```
   AUDIO_DEVICE=Your Device Name
   ```

### High CPU Usage

1. Use a smaller model in `.env`:
   ```
   WHISPER_MODEL=tiny.en
   ```

2. Reduce chunk duration:
   ```
   CHUNK_DURATION=0.3
   ```

### Model Loading Fails

Check `errors.log` for details. Common issues:

- Insufficient memory: Use smaller model
- Network issues: Check internet connection
- CUDA errors: Set `USE_GPU=false`

## Performance Tuning

### For Lower Latency

- Use `tiny.en` or `base` model
- Set `CHUNK_DURATION=0.3`
- Enable GPU: `USE_GPU=true`

### For Better Accuracy

- Use `small` or `medium` model
- Set `CHUNK_DURATION=0.5`
- Set `BEAM_SIZE=5`

## Backup and Recovery

### Logs

Logs are automatically rotated when they reach 10MB. Keep backups of:

- `logs/stt_app.log`
- `logs/errors.log`

### Configuration

Always backup your `.env` file before making changes.

## Security Considerations

1. **File Permissions**: Ensure `.env` has restricted permissions
2. **Log Files**: Logs may contain sensitive information; secure accordingly
3. **Network Access**: If exposing via API, use proper authentication

## Updates

To update the application:

1. Backup configuration:
   ```bash
   copy .env .env.backup
   ```

2. Pull latest code:
   ```bash
   git pull
   ```

3. Update dependencies:
   ```bash
   pip install -r requirements.txt --upgrade
   ```

4. Restart application

## Support

For issues or questions:

1. Check logs in `logs/` directory
2. Review `README.md` troubleshooting section
3. Check configuration in `.env`

## License

See LICENSE file for details.
