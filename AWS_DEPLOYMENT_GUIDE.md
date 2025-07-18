# 🚀 GatherGuru AWS Deployment Guide

This guide will walk you through deploying your GatherGuru application to AWS using EC2, S3, and CloudFront.

## 📋 Prerequisites

- AWS Account with appropriate permissions
- Domain name (optional but recommended)
- Basic knowledge of AWS services
- SSH key pair for EC2 access

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Route 53      │    │   CloudFront    │    │   S3 + CloudFront│
│   (Domain)      │───▶│   (CDN)         │───▶│   (Frontend)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │◀───│   Load Balancer │◀───│   EC2 Instance  │
│   Load Balancer │    │   (ALB)         │    │   (Backend)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   S3            │    │   CloudFront    │    │   MongoDB Atlas │
│   (File Storage)│◀───│   (CDN)         │◀───│   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 Deployment Options

### Option 1: Simple EC2 Deployment (Recommended for MVP)
- **Cost**: ~$20-50/month
- **Complexity**: Low
- **Scalability**: Manual

### Option 2: ECS with Fargate (Recommended for Production)
- **Cost**: ~$50-150/month
- **Complexity**: Medium
- **Scalability**: Auto-scaling

### Option 3: AWS Amplify + Lambda (Serverless)
- **Cost**: ~$10-30/month
- **Complexity**: Low
- **Scalability**: Auto-scaling

---

## 📝 Step-by-Step Deployment

### Phase 1: AWS Infrastructure Setup

#### 1.1 Create EC2 Instance

1. **Launch EC2 Instance**:
   - Go to AWS Console → EC2 → Launch Instance
   - Choose Ubuntu Server 22.04 LTS
   - Instance Type: t3.medium (2 vCPU, 4 GB RAM)
   - Storage: 20 GB gp3
   - Security Group: Create new with rules:
     - SSH (22): Your IP
     - HTTP (80): 0.0.0.0/0
     - HTTPS (443): 0.0.0.0/0
   - Key Pair: Create or select existing

2. **Connect to Instance**:
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-public-ip
   ```

#### 1.2 Set Up MongoDB Atlas

1. **Create MongoDB Atlas Account**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create free cluster
   - Choose AWS as cloud provider
   - Select region close to your EC2 instance

2. **Configure Network Access**:
   - Add your EC2 public IP to IP Access List
   - Or add `0.0.0.0/0` for development (not recommended for production)

3. **Create Database User**:
   - Create username/password for database access
   - Save connection string

#### 1.3 Create S3 Bucket for File Storage

1. **Create S3 Bucket**:
   - Go to AWS Console → S3 → Create Bucket
   - Bucket name: `gatherguru-uploads`
   - Region: Same as your EC2 instance
   - Block all public access: Uncheck (for public file access)

2. **Configure CORS**:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
   ```

3. **Create IAM User for S3 Access**:
   - Go to IAM → Users → Create User
   - Attach policy: `AmazonS3FullAccess` (or create custom policy)
   - Save Access Key ID and Secret Access Key

### Phase 2: Application Deployment

#### 2.1 Prepare Your Code

1. **Update Environment Variables**:
   ```bash
   # Backend/.env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/gatherguru
   JWT_SECRET=your-super-secret-jwt-key-here
   NODE_ENV=production
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_REGION=us-east-1
   S3_BUCKET_NAME=gatherguru-uploads
   ```

2. **Update Frontend Environment**:
   ```bash
   # Frontend/.env
   VITE_API_URL=https://your-domain.com/api
   ```

#### 2.2 Deploy to EC2

1. **Upload Code to EC2**:
   ```bash
   # From your local machine
   scp -i your-key.pem -r . ubuntu@your-ec2-public-ip:/home/ubuntu/gatherguru
   ```

2. **Run Deployment Script**:
   ```bash
   # On EC2 instance
   cd /home/ubuntu/gatherguru
   chmod +x deploy.sh
   sudo ./deploy.sh
   ```

3. **Configure Environment Variables**:
   ```bash
   sudo nano /var/www/gatherguru/.env
   # Add your production environment variables
   ```

### Phase 3: Domain and SSL Setup

#### 3.1 Configure Domain (Optional)

1. **Route 53 Setup**:
   - Go to Route 53 → Hosted Zones
   - Create hosted zone for your domain
   - Add A record pointing to your EC2 public IP

2. **Update Nginx Configuration**:
   ```bash
   sudo nano /etc/nginx/sites-available/gatherguru
   # Replace 'your-domain.com' with your actual domain
   sudo nginx -t
   sudo systemctl restart nginx
   ```

#### 3.2 SSL Certificate Setup

1. **Install Certbot**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Obtain SSL Certificate**:
   ```bash
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

3. **Auto-renewal**:
   ```bash
   sudo crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

### Phase 4: Monitoring and Maintenance

#### 4.1 Set Up Monitoring

1. **PM2 Monitoring**:
   ```bash
   pm2 monit
   pm2 logs
   ```

2. **Nginx Logs**:
   ```bash
   sudo tail -f /var/log/nginx/access.log
   sudo tail -f /var/log/nginx/error.log
   ```

#### 4.2 Backup Strategy

1. **Database Backup**:
   - MongoDB Atlas provides automatic backups
   - Consider setting up additional backup scripts

2. **Application Backup**:
   ```bash
   # Create backup script
   sudo nano /var/www/gatherguru/backup.sh
   ```

---

## 🔧 Configuration Files

### Nginx Configuration
The deployment script creates an optimized nginx configuration with:
- Gzip compression
- Security headers
- SSL support
- Proxy to Node.js application

### PM2 Configuration
The `ecosystem.config.js` file configures:
- Cluster mode for multiple processes
- Automatic restarts
- Log management
- Memory limits

### Environment Variables
Make sure to set these in your production `.env` file:
- `MONGO_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: Strong secret key for JWT tokens
- `AWS_ACCESS_KEY_ID`: S3 access key
- `AWS_SECRET_ACCESS_KEY`: S3 secret key
- `S3_BUCKET_NAME`: Your S3 bucket name

---

## 🚨 Security Considerations

1. **Firewall**: Only open necessary ports (22, 80, 443)
2. **SSL**: Always use HTTPS in production
3. **Environment Variables**: Never commit `.env` files to version control
4. **Database**: Use strong passwords and restrict network access
5. **Updates**: Regularly update system packages and dependencies

---

## 📊 Cost Optimization

### EC2 Instance Sizing
- **Development**: t3.micro (~$8/month)
- **MVP**: t3.small (~$16/month)
- **Production**: t3.medium (~$32/month)

### S3 Storage
- Standard storage: $0.023 per GB
- CloudFront: $0.085 per GB transferred

### MongoDB Atlas
- Free tier: 512MB storage
- Paid plans: Starting at $9/month

---

## 🔄 Deployment Updates

### Backend Updates
```bash
# On EC2 instance
cd /var/www/gatherguru
git pull origin main
npm install --production
pm2 restart all
```

### Frontend Updates
```bash
# On your local machine
cd Frontend
npm run build
scp -i your-key.pem -r dist/* ubuntu@your-ec2-public-ip:/var/www/gatherguru/
```

---

## 🆘 Troubleshooting

### Common Issues

1. **Application Not Starting**:
   ```bash
   pm2 logs
   pm2 restart all
   ```

2. **Nginx Errors**:
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

3. **Database Connection Issues**:
   - Check MongoDB Atlas network access
   - Verify connection string
   - Check firewall rules

4. **File Upload Issues**:
   - Verify S3 bucket permissions
   - Check AWS credentials
   - Ensure CORS is configured

### Performance Issues

1. **High Memory Usage**:
   - Increase EC2 instance size
   - Optimize Node.js memory settings
   - Implement caching

2. **Slow Response Times**:
   - Enable CloudFront CDN
   - Optimize database queries
   - Implement Redis caching

---

## 📞 Support

If you encounter issues during deployment:

1. Check the logs: `pm2 logs` and `sudo journalctl -u nginx`
2. Verify all environment variables are set correctly
3. Ensure all AWS services are properly configured
4. Test the health endpoint: `https://your-domain.com/health`

---

## 🎉 Next Steps

After successful deployment:

1. Set up monitoring and alerting
2. Implement automated backups
3. Configure CI/CD pipeline
4. Set up staging environment
5. Implement load balancing for high availability

---

*This guide covers the basic deployment. For production environments, consider additional security measures, monitoring, and scaling strategies.* 