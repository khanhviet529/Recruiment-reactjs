import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Typography, 
  Tabs, 
  DatePicker, 
  Button, 
  Table,
  Select,
  Spin,
  Empty,
  Alert,
  Divider,
  Radio,
  Tag,
  Tooltip,
  Progress,
  message
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  RiseOutlined,
  FallOutlined,
  ReloadOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  DownloadOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  FireOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { Chart } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title as ChartTitle, 
  Tooltip as ChartTooltip, 
  Legend,
  Filler
} from 'chart.js';
import moment from 'moment';

// Import our new component modules
import {
  UserTrendsChart,
  JobTrendsChart,
  IndustryAnalysis,
  generatePdfReport,
  exportChartToImage,
  setChartRef,
} from '../../components/admin/Reports';
// import UserTrendsChart from '../../components/admin/reports/UserTrendsChart';
// import JobTrendsChart from '../../components/admin/reports/JobTrendsChart';
// import IndustryAnalysis from '../../components/admin/reports/IndustryAnalysis';
// import { generatePdfReport } from '../../components/admin/reports/generatePdfReport';
// import { exportChartToImage } from '../../components/admin/reports/exportChartToImage';
// import { setChartRef } from '../../components/admin/reports/setChartRef';


// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  ChartTitle,
  ChartTooltip,
  Legend,
  Filler
);

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Wrapper component for card sections with loading state
const SectionCard = ({ title, loading, children, extra = null }) => (
  <Card 
    title={title} 
    className="mb-4"
    extra={extra}
  >
    {loading ? (
      <div style={{ textAlign: 'center', padding: '30px 0' }}>
        <Spin tip={`Đang tải dữ liệu ${title.toLowerCase()}...`} />
      </div>
    ) : (
      children
    )}
  </Card>
);

const ReportsPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  
  // Overall statistics
  const [statsData, setStatsData] = useState({
    users: {
      total: 0,
      employers: 0,
      candidates: 0,
      growth: 0
    },
    jobs: {
      total: 0,
      active: 0,
      applications: 0,
      growth: 0
    }
  });
  
  // Charts data
  const [userChartData, setUserChartData] = useState({
    labels: [],
    datasets: [],
    annotations: [],
    growthRates: {
      users: {},
      employers: {}
    }
  });
  
  const [jobChartData, setJobChartData] = useState({
    labels: [],
    datasets: [],
    annotations: [],
    growthRates: {
      jobs: {},
      applications: {}
    },
    conversionRates: {}
  });
  
  // Distribution analytics
  const [industryDistribution, setIndustryDistribution] = useState({
    labels: [],
    datasets: [],
    yearOverYearChange: {}
  });
  
  const [geographicDistribution, setGeographicDistribution] = useState({
    regions: {},
    topCities: [],
    growthAreas: []
  });
  
  const [skillsDistribution, setSkillsDistribution] = useState({
    topSkills: [],
    risingSkills: [],
    skillsByIndustry: {}
  });
  
  // Top performing lists
  const [topEmployers, setTopEmployers] = useState([]);
  const [topJobs, setTopJobs] = useState([]);
  
  // Performance benchmarks
  const [benchmarks, setBenchmarks] = useState({
    applicationRates: {
      average: 0,
      topQuartile: 0,
      median: 0,
      bottomQuartile: 0
    },
    timeToFill: {
      average: 0,
      topQuartile: 0,
      median: 0,
      bottomQuartile: 0
    },
    hiringRates: {
      average: 0,
      topQuartile: 0,
      median: 0,
      bottomQuartile: 0
    }
  });
  
  // Applications data
  const [applicationStats, setApplicationStats] = useState({
    labels: [],
    datasets: [{
      label: '',
      data: [0, 0, 0, 0, 0],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1
    }],
    stageConversion: {
      viewToApply: 0,
      applyToScreen: 0,
      screenToInterview: 0,
      interviewToOffer: 0
    },
    trendsOverTime: {}
  });
  
  // Advanced analytics data
  const [recruiterPerformance, setRecruiterPerformance] = useState([]);
  const [jobMarketTrends, setJobMarketTrends] = useState({
    topSkills: [],
    topLocations: [],
    salaryRanges: {
      labels: [],
      datasets: []
    },
    jobTypes: {
      labels: [],
      datasets: []
    }
  });
  
  // Time-to-fill metrics
  const [timeToFillData, setTimeToFillData] = useState({
    average: 0,
    byIndustry: []
  });
  
  // Conversion metrics
  const [conversionData, setConversionData] = useState({
    overall: {
      viewed: 0,
      applied: 0, 
      interviewed: 0,
      hired: 0
    },
    rates: {
      viewToApply: 0,
      applyToInterview: 0,
      interviewToHire: 0
    },
    funnel: {
      labels: ['Viewed', 'Applied', 'Interviewed', 'Hired'],
      datasets: [{
        data: [0, 0, 0, 0],
        backgroundColor: [
          'rgba(54, 162, 235, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 99, 132, 0.5)'
        ]
      }]
    }
  });
  
  // Report time periods
  const [timeFrame, setTimeFrame] = useState('monthly');
  const [activeTab, setActiveTab] = useState('1');
  
  // Setup chart export references
  const [chartRefs, setChartRefs] = useState({
    userChart: React.createRef(),
    jobChart: React.createRef(),
    applicationChart: React.createRef()
  });
  
  useEffect(() => {
    fetchData();
  }, []);
  
  // We'll implement the fetchData function next
  const fetchData = async (period = timeFrame) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all required data in parallel
      const [
        usersData, 
        jobsData, 
        applicationsData, 
        employersData,
        categoriesData,
        skillsData,
        locationsData
      ] = await Promise.all([
        axios.get('http://localhost:5000/users'),
        axios.get('http://localhost:5000/jobs'),
        axios.get('http://localhost:5000/applications'),
        axios.get('http://localhost:5000/employers'),
        axios.get('http://localhost:5000/categories'),
        axios.get('http://localhost:5000/skills'),
        axios.get('http://localhost:5000/locations')
      ]);
      
      // Extract data from responses
      const allUsers = usersData.data || [];
      const users = allUsers.filter(user => user.role !== 'admin');
      const jobs = jobsData.data || [];
      const applications = applicationsData.data || [];
      const employers = employersData.data || [];
      const categories = categoriesData.data || [];
      const skills = skillsData.data || [];
      const locations = locationsData.data || [];
      
      // Process users statistics
      const totalUsers = users.length;
      const employerCount = users.filter(user => user.role === 'employer').length;
      const candidateCount = users.filter(user => user.role === 'applicant').length;
      
      // Calculate user growth (users registered in the last 30 days)
      const thirtyDaysAgo = moment().subtract(30, 'days');
      const usersLast30Days = users.filter(user => 
        moment(user.createdAt).isAfter(thirtyDaysAgo)
      ).length;
      const userGrowthRate = totalUsers > 0 
        ? ((usersLast30Days / totalUsers) * 100).toFixed(1) 
        : 0;
      
      // Process jobs statistics
      const totalJobs = jobs.length;
      const activeJobs = jobs.filter(job => job.status === 'active').length;
      
      // Calculate job growth (jobs posted in the last 30 days)
      const jobsLast30Days = jobs.filter(job => 
        moment(job.postedAt || job.createdAt).isAfter(thirtyDaysAgo)
      ).length;
      const jobGrowthRate = totalJobs > 0 
        ? ((jobsLast30Days / totalJobs) * 100).toFixed(1) 
        : 0;
      
      // Process applications statistics
      const totalApplications = applications.length;
      
      // Set overall statistics
      setStatsData({
        users: {
          total: totalUsers,
          employers: employerCount,
          candidates: candidateCount,
          growth: parseFloat(userGrowthRate)
        },
        jobs: {
          total: totalJobs,
          active: activeJobs,
          applications: totalApplications,
          growth: parseFloat(jobGrowthRate)
        }
      });
      
      // Process user registration trends based on selected time period
      const userRegistrationData = processTimePeriodData(users, 'createdAt', period);
      const employerRegistrationData = processTimePeriodData(
        users.filter(user => user.role === 'employer'), 
        'createdAt', 
        period
      );
      
      // Calculate growth rates and comparisons
      const userGrowthRatesByPeriod = calculateGrowthRates(userRegistrationData);
      const employerGrowthRatesByPeriod = calculateGrowthRates(employerRegistrationData);
      
      // Set user registration chart data
      setUserChartData({
        labels: Object.keys(userRegistrationData),
        datasets: [
          {
            label: 'Ứng viên',
            data: Object.values(userRegistrationData),
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            tension: 0.4
          },
          {
            label: 'Nhà tuyển dụng',
            data: Object.values(employerRegistrationData),
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            tension: 0.4
          }
        ],
        annotations: getSignificantChangeAnnotations(userRegistrationData, 15),
        growthRates: {
          users: userGrowthRatesByPeriod,
          employers: employerGrowthRatesByPeriod
        }
      });
      
      // Process job posting and application trends
      const jobPostingData = processTimePeriodData(jobs, 'postedAt', period);
      const applicationData = processTimePeriodData(applications, 'appliedAt', period);
      
      // Calculate growth rates for jobs and applications
      const jobGrowthRatesByPeriod = calculateGrowthRates(jobPostingData);
      const applicationGrowthRatesByPeriod = calculateGrowthRates(applicationData);
      
      // Calculate conversion rate (applications / job views)
      const conversionRateData = {};
      Object.keys(jobPostingData).forEach(period => {
        const jobViews = jobs
          .filter(job => {
            const postedDate = moment(job.postedAt || job.createdAt);
            return period === postedDate.format(period === 'daily' ? 'DD/MM' : period === 'weekly' ? 'W-YYYY' : 'MMM YYYY');
          })
          .reduce((sum, job) => sum + (job.views || 0), 0);
        
        const periodApplications = applicationData[period] || 0;
        conversionRateData[period] = jobViews > 0 ? (periodApplications / jobViews * 100).toFixed(1) : 0;
      });
      
      // Set job posting and application chart data
      setJobChartData({
        labels: Object.keys(jobPostingData),
        datasets: [
          {
            label: 'Tin đăng tuyển',
            data: Object.values(jobPostingData),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            tension: 0.4
          },
          {
            label: 'Đơn ứng tuyển',
            data: Object.values(applicationData),
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 2,
            tension: 0.4
          }
        ],
        annotations: getSignificantChangeAnnotations(applicationData, 20),
        growthRates: {
          jobs: jobGrowthRatesByPeriod,
          applications: applicationGrowthRatesByPeriod
        },
        conversionRates: conversionRateData
      });
      
      // Process top employers
      const employerStats = employers.map(employer => {
        const employerJobs = jobs.filter(job => job.employerId === employer.id);
        const jobIds = employerJobs.map(job => job.id);
        const applicationCount = applications.filter(app => jobIds.includes(app.jobId)).length;
        
        // Calculate hiring rate
        const jobsWithHiredApplicants = employerJobs.filter(job => {
          const jobApplications = applications.filter(app => app.jobId === job.id);
          return jobApplications.some(app => app.status === 'offered');
        }).length;
        
        const hiringRate = employerJobs.length > 0 
          ? (jobsWithHiredApplicants / employerJobs.length * 100).toFixed(1)
          : 0;
        
        // Calculate average time to fill
        let totalDaysToFill = 0;
        let filledJobsCount = 0;
        
        employerJobs.forEach(job => {
          const hiredApplication = applications.find(app => 
            app.jobId === job.id && app.status === 'offered'
          );
          
          if (hiredApplication) {
            const postDate = moment(job.postedAt || job.createdAt);
            const hireDate = moment(hiredApplication.updatedAt);
            totalDaysToFill += hireDate.diff(postDate, 'days');
            filledJobsCount++;
          }
        });
        
        const avgTimeToFill = filledJobsCount > 0 
          ? Math.round(totalDaysToFill / filledJobsCount)
          : 0;
        
        return {
          id: employer.id,
          name: employer.companyName || `Công ty ${employer.id}`,
          jobs: employerJobs.length,
          applications: applicationCount,
          hiringRate: parseFloat(hiringRate),
          avgTimeToFill
        };
      });
      
      // Sort by application count (descending)
      const sortedEmployers = [...employerStats].sort((a, b) => b.applications - a.applications);
      setTopEmployers(sortedEmployers.slice(0, 5)); // Top 5 employers
      
      // Process top jobs by applications
      const jobWithApplications = jobs.map(job => {
        const jobApplications = applications.filter(app => app.jobId === job.id);
        const applicationCount = jobApplications.length;
        const employer = employers.find(emp => emp.id === job.employerId);
        const jobCategory = categories.find(cat => job.categories?.includes(cat.id));
        
        // Calculate conversion rates
        const interviewCount = jobApplications.filter(app => 
          app.status === 'interviewing'
        ).length;
        
        const offerCount = jobApplications.filter(app => 
          app.status === 'offered'
        ).length;
        
        const conversionRate = applicationCount > 0 
          ? (interviewCount / applicationCount * 100).toFixed(1) 
          : 0;
        
        return {
          id: job.id,
          title: job.title,
          company: employer ? employer.companyName : 'Unknown Company',
          category: jobCategory ? jobCategory.name : 'Uncategorized',
          location: job.location,
          applications: applicationCount,
          interviews: interviewCount,
          offers: offerCount,
          conversionRate: parseFloat(conversionRate)
        };
      });
      
      // Sort by application count (descending)
      const sortedJobs = [...jobWithApplications].sort((a, b) => b.applications - a.applications);
      setTopJobs(sortedJobs.slice(0, 5)); // Top 5 jobs
      
      // Process application status statistics for pie chart
      const statusCount = {
        'applied': 0,     // Just applied
        'reviewing': 0,   // Under review
        'interviewing': 0, // In interview process
        'offered': 0,     // Job offered
        'rejected': 0     // Rejected
      };
      
      applications.forEach(app => {
        if (statusCount.hasOwnProperty(app.status)) {
          statusCount[app.status]++;
        } else {
          // For any other status, count as reviewing
          statusCount.reviewing++;
        }
      });
      
      // Application status chart data
      setApplicationStats({
        labels: ['Đã nộp', 'Đang xem xét', 'Đã phỏng vấn', 'Đã nhận việc', 'Đã từ chối'],
        datasets: [
          {
            label: 'Trạng thái đơn ứng tuyển',
            data: [
              statusCount.applied,
              statusCount.reviewing,
              statusCount.interviewing,
              statusCount.offered,
              statusCount.rejected
            ],
            backgroundColor: [
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 99, 132, 0.6)'
            ],
            borderColor: [
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 99, 132, 1)'
            ],
            borderWidth: 1
          }
        ]
      });
      
      // Calculate time-to-fill metrics
      const jobsWithHires = jobs.filter(job => {
        return applications.some(app => app.jobId === job.id && app.status === 'offered');
      });
      
      let totalDaysToFill = 0;
      
      jobsWithHires.forEach(job => {
        const hiredApplication = applications.find(app => 
          app.jobId === job.id && app.status === 'offered'
        );
        
        if (hiredApplication) {
          const postDate = moment(job.postedAt || job.createdAt);
          const hireDate = moment(hiredApplication.updatedAt);
          totalDaysToFill += hireDate.diff(postDate, 'days');
        }
      });
      
      const averageTimeToFill = jobsWithHires.length > 0 
        ? Math.round(totalDaysToFill / jobsWithHires.length)
        : 0;
      
      // Calculate time-to-fill by industry
      const industriesTimeToFill = {};
      const industriesCount = {};
      
      jobsWithHires.forEach(job => {
        const jobCategory = job.categories?.[0] || 'unknown';
        const category = categories.find(cat => cat.id === jobCategory);
        const categoryName = category ? category.name : 'Khác';
        
        const hiredApplication = applications.find(app => 
          app.jobId === job.id && app.status === 'offered'
        );
        
        if (hiredApplication) {
          const postDate = moment(job.postedAt || job.createdAt);
          const hireDate = moment(hiredApplication.updatedAt);
          const daysToFill = hireDate.diff(postDate, 'days');
          
          if (!industriesTimeToFill[categoryName]) {
            industriesTimeToFill[categoryName] = 0;
            industriesCount[categoryName] = 0;
          }
          
          industriesTimeToFill[categoryName] += daysToFill;
          industriesCount[categoryName]++;
        }
      });
      
      const timeToFillByIndustry = Object.keys(industriesTimeToFill).map(industry => {
        return {
          industry,
          averageDays: Math.round(industriesTimeToFill[industry] / industriesCount[industry])
        };
      }).sort((a, b) => a.averageDays - b.averageDays);
      
      setTimeToFillData({
        average: averageTimeToFill,
        byIndustry: timeToFillByIndustry
      });
      
      // Process conversion funnel data
      const viewCount = jobs.reduce((total, job) => total + (job.views || 0), 0);
      const applyCount = applications.length;
      const interviewCount = applications.filter(app => 
        app.status === 'interviewing' || app.status === 'offered' || app.status === 'rejected'
      ).length;
      const hireCount = applications.filter(app => app.status === 'offered').length;
      
      // Calculate conversion rates
      const viewToApplyRate = viewCount > 0 ? (applyCount / viewCount * 100).toFixed(1) : 0;
      const applyToInterviewRate = applyCount > 0 ? (interviewCount / applyCount * 100).toFixed(1) : 0;
      const interviewToHireRate = interviewCount > 0 ? (hireCount / interviewCount * 100).toFixed(1) : 0;
      
      setConversionData({
        overall: {
          viewed: viewCount,
          applied: applyCount,
          interviewed: interviewCount,
          hired: hireCount
        },
        rates: {
          viewToApply: parseFloat(viewToApplyRate),
          applyToInterview: parseFloat(applyToInterviewRate),
          interviewToHire: parseFloat(interviewToHireRate)
        },
        funnel: {
          labels: ['Lượt xem', 'Đơn ứng tuyển', 'Phỏng vấn', 'Nhận việc'],
          datasets: [{
            data: [viewCount, applyCount, interviewCount, hireCount],
            backgroundColor: [
              'rgba(54, 162, 235, 0.5)',
              'rgba(75, 192, 192, 0.5)',
              'rgba(153, 102, 255, 0.5)',
              'rgba(255, 99, 132, 0.5)'
            ]
          }]
        }
      });
      
      // Process job market trends
      // 1. Top skills in demand
      const skillCounts = {};
      
      jobs.forEach(job => {
        if (job.skills && Array.isArray(job.skills)) {
          job.skills.forEach(skillId => {
            if (!skillCounts[skillId]) {
              skillCounts[skillId] = 0;
            }
            skillCounts[skillId]++;
          });
        }
      });
      
      const topSkillsData = Object.entries(skillCounts)
        .map(([skillId, count]) => {
          const skillInfo = skills.find(s => s.id === skillId) || { name: skillId };
          return {
            id: skillId,
            name: skillInfo.name,
            count
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      // 2. Top locations
      const locationCounts = {};
      
      jobs.forEach(job => {
        const locationId = job.location || job.locationId;
        if (locationId) {
          if (!locationCounts[locationId]) {
            locationCounts[locationId] = 0;
          }
          locationCounts[locationId]++;
        }
      });
      
      const topLocationsData = Object.entries(locationCounts)
        .map(([locationId, count]) => {
          const locationInfo = locations.find(l => l.id === locationId) || 
                              { name: locationId };
          return {
            id: locationId,
            name: locationInfo.name,
            count
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      // 3. Salary ranges
      const salaryCounts = {
        'under_1000': 0,
        '1000_2000': 0,
        '2000_3000': 0,
        '3000_4000': 0,
        '4000_plus': 0
      };
      
      jobs.forEach(job => {
        if (job.salary) {
          const minSalary = job.salary.min || 0;
          if (minSalary < 1000) {
            salaryCounts.under_1000++;
          } else if (minSalary < 2000) {
            salaryCounts['1000_2000']++;
          } else if (minSalary < 3000) {
            salaryCounts['2000_3000']++;
          } else if (minSalary < 4000) {
            salaryCounts['3000_4000']++;
          } else {
            salaryCounts['4000_plus']++;
          }
        }
      });
      
      // 4. Job types
      const jobTypeCounts = {};
      
      jobs.forEach(job => {
        const jobType = job.jobType;
        if (jobType) {
          if (!jobTypeCounts[jobType]) {
            jobTypeCounts[jobType] = 0;
          }
          jobTypeCounts[jobType]++;
        }
      });
      
      const jobTypesData = Object.entries(jobTypeCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);
      
      setJobMarketTrends({
        topSkills: topSkillsData,
        topLocations: topLocationsData,
        salaryRanges: {
          labels: ['Dưới 1000$', '1000-2000$', '2000-3000$', '3000-4000$', 'Trên 4000$'],
          datasets: [{
            label: 'Số tin tuyển dụng',
            data: [
              salaryCounts.under_1000,
              salaryCounts['1000_2000'],
              salaryCounts['2000_3000'],
              salaryCounts['3000_4000'],
              salaryCounts['4000_plus']
            ],
            backgroundColor: 'rgba(75, 192, 192, 0.6)'
          }]
        },
        jobTypes: {
          labels: jobTypesData.map(item => {
            const typeLabels = {
              'full-time': 'Toàn thời gian',
              'part-time': 'Bán thời gian',
              'contract': 'Hợp đồng',
              'remote': 'Từ xa',
              'internship': 'Thực tập'
            };
            return typeLabels[item.type] || item.type;
          }),
          datasets: [{
            label: 'Số tin tuyển dụng',
            data: jobTypesData.map(item => item.count),
            backgroundColor: [
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(153, 102, 255, 0.6)'
            ]
          }]
        }
      });
      
      // Process recruiter performance
      const recruiters = users.filter(user => user.role === 'employer');
      const recruiterStats = recruiters.map(recruiter => {
        const associatedEmployer = employers.find(emp => emp.userId === recruiter.id);
        if (!associatedEmployer) return null;
        
        const recruiterJobs = jobs.filter(job => job.employerId === associatedEmployer.id);
        const jobIds = recruiterJobs.map(job => job.id);
        const recruiterApplications = applications.filter(app => jobIds.includes(app.jobId));
        
        const totalApplications = recruiterApplications.length;
        const totalInterviews = recruiterApplications.filter(app => 
          app.status === 'interviewing' || app.status === 'offered' || app.status === 'rejected'
        ).length;
        const totalOffers = recruiterApplications.filter(app => 
          app.status === 'offered'
        ).length;
        
        // Calculate efficiency metrics
        const applicationToInterviewRate = totalApplications > 0 
          ? (totalInterviews / totalApplications * 100).toFixed(1) 
          : 0;
        
        const interviewToOfferRate = totalInterviews > 0 
          ? (totalOffers / totalInterviews * 100).toFixed(1) 
          : 0;
        
        // Calculate average time to fill
        let totalDaysToFill = 0;
        let filledJobsCount = 0;
        
        recruiterJobs.forEach(job => {
          const hiredApplication = recruiterApplications.find(app => 
            app.jobId === job.id && app.status === 'offered'
          );
          
          if (hiredApplication) {
            const postDate = moment(job.postedAt || job.createdAt);
            const hireDate = moment(hiredApplication.updatedAt);
            totalDaysToFill += hireDate.diff(postDate, 'days');
            filledJobsCount++;
          }
        });
        
        const avgDaysToFill = filledJobsCount > 0 
          ? Math.round(totalDaysToFill / filledJobsCount)
          : 0;
        
        return {
          id: recruiter.id,
          name: recruiter.fullName || recruiter.email,
          company: associatedEmployer.companyName || `Công ty ${associatedEmployer.id}`,
          jobsPosted: recruiterJobs.length,
          applications: totalApplications,
          interviews: totalInterviews,
          offers: totalOffers,
          appToInterviewRate: parseFloat(applicationToInterviewRate),
          interviewToOfferRate: parseFloat(interviewToOfferRate),
          avgDaysToFill
        };
      }).filter(Boolean);
      
      // Sort by interviews (descending) as a measure of activity
      const sortedRecruiters = [...recruiterStats].sort((a, b) => b.interviews - a.interviews);
      setRecruiterPerformance(sortedRecruiters.slice(0, 5)); // Top 5 recruiters
      
    } catch (error) {
      handleApiError(error, 'báo cáo');
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to process data based on time period (daily, weekly, monthly)
  const processTimePeriodData = (data, dateField, period) => {
    const result = {};
    
    // Determine format based on period
    let format;
    let limit;
    
    switch (period) {
      case 'daily':
        format = 'DD/MM';
        limit = 30; // Last 30 days
        break;
      case 'weekly':
        format = 'W-YYYY';
        limit = 12; // Last 12 weeks
        break;
      case 'monthly':
      default:
        format = 'MMM YYYY';
        limit = 12; // Last 12 months
        break;
    }
    
    // Generate empty periods
    for (let i = limit - 1; i >= 0; i--) {
      let date;
      
      if (period === 'daily') {
        date = moment().subtract(i, 'days');
      } else if (period === 'weekly') {
        date = moment().subtract(i, 'weeks');
      } else {
        date = moment().subtract(i, 'months');
      }
      
      const key = date.format(format);
      result[key] = 0;
    }
    
    // Fill in data
    data.forEach(item => {
      const date = moment(item[dateField] || item.createdAt);
      const key = date.format(format);
      
      if (result.hasOwnProperty(key)) {
        result[key]++;
      }
    });
    
    return result;
  };
  
  // Helper function to handle API errors
  const handleApiError = (error, source) => {
    console.error(`Error fetching ${source} data:`, error);
    setError(`Không thể tải dữ liệu ${source}. Vui lòng thử lại sau.`);
    setLoading(false);
  };
  
  // Helper function to get specific data from chart datasets
  const getChartData = (chartData, datasetIndex, labelIndex, defaultValue = 0) => {
    if (!chartData || 
        !chartData.datasets || 
        !chartData.datasets[datasetIndex] || 
        !chartData.datasets[datasetIndex].data || 
        !chartData.datasets[datasetIndex].data[labelIndex]) {
      return defaultValue;
    }
    return chartData.datasets[datasetIndex].data[labelIndex];
  };
  
  // Helper function to sum specific data points from chart datasets
  const sumChartData = (chartData, datasetIndex, labelIndices, defaultValue = 0) => {
    if (!chartData || 
        !chartData.datasets || 
        !chartData.datasets[datasetIndex] || 
        !chartData.datasets[datasetIndex].data) {
      return defaultValue;
    }
    
    return labelIndices.reduce((sum, index) => {
      const value = chartData.datasets[datasetIndex].data[index] || 0;
      return sum + value;
    }, 0);
  };
  
  // Helper function to calculate growth rates between periods
  const calculateGrowthRates = (periodData) => {
    const periods = Object.keys(periodData);
    const values = Object.values(periodData);
    const growthRates = {};
    
    for (let i = 1; i < periods.length; i++) {
      const currentValue = values[i];
      const previousValue = values[i-1];
      const growthRate = previousValue > 0 
        ? ((currentValue - previousValue) / previousValue * 100).toFixed(1)
        : currentValue > 0 ? 100 : 0;
      
      growthRates[periods[i]] = parseFloat(growthRate);
    }
    
    return growthRates;
  };
  
  // Helper function to identify significant changes for annotations
  const getSignificantChangeAnnotations = (periodData, thresholdPercent = 15) => {
    const periods = Object.keys(periodData);
    const values = Object.values(periodData);
    const annotations = [];
    
    for (let i = 1; i < periods.length; i++) {
      const currentValue = values[i];
      const previousValue = values[i-1];
      
      if (previousValue > 0) {
        const changePercent = ((currentValue - previousValue) / previousValue * 100);
        
        // Add annotation for significant increases or decreases
        if (Math.abs(changePercent) >= thresholdPercent) {
          annotations.push({
            period: periods[i],
            value: currentValue,
            changePercent: changePercent.toFixed(1),
            isIncrease: changePercent > 0
          });
        }
      } else if (currentValue > 0 && previousValue === 0) {
        // First appearance
        annotations.push({
          period: periods[i],
          value: currentValue,
          changePercent: 100,
          isIncrease: true,
          isFirst: true
        });
      }
    }
    
    return annotations;
  };
  
  // Helper function for industry/category distribution analysis
  const analyzeDistribution = (items, categoryField, valueField = null) => {
    const distribution = {};
    
    items.forEach(item => {
      const category = item[categoryField];
      if (category) {
        if (Array.isArray(category)) {
          // Handle array of categories
          category.forEach(cat => {
            if (!distribution[cat]) distribution[cat] = valueField ? item[valueField] || 1 : 1;
            else distribution[cat] += valueField ? item[valueField] || 1 : 1;
          });
        } else {
          // Handle single category
          if (!distribution[category]) distribution[category] = valueField ? item[valueField] || 1 : 1;
          else distribution[category] += valueField ? item[valueField] || 1 : 1;
        }
      }
    });
    
    return distribution;
  };
  
  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    if (dates && dates[0] && dates[1]) {
      filterDataByDateRange(dates[0], dates[1]);
    } else {
      fetchData();
    }
  };
  
  const handleTimeFrameChange = (e) => {
    setTimeFrame(e.target.value);
    fetchData(e.target.value);
  };
  
  const filterDataByDateRange = async (startDate, endDate) => {
    try {
      setLoading(true);
      
      const [
        usersData, 
        jobsData, 
        applicationsData
      ] = await Promise.all([
        axios.get('http://localhost:5000/users'),
        axios.get('http://localhost:5000/jobs'),
        axios.get('http://localhost:5000/applications')
      ]);
      
      // Filter data by date range
      const filteredUsers = usersData.data.filter(user => {
        const createdAt = moment(user.createdAt);
        return createdAt.isBetween(startDate, endDate, null, '[]');
      });
      
      const filteredJobs = jobsData.data.filter(job => {
        const postedAt = moment(job.postedAt || job.createdAt);
        return postedAt.isBetween(startDate, endDate, null, '[]');
      });
      
      const filteredApplications = applicationsData.data.filter(app => {
        const appliedAt = moment(app.appliedAt || app.createdAt);
        return appliedAt.isBetween(startDate, endDate, null, '[]');
      });
      
      // Update stats with filtered data
      const totalUsers = filteredUsers.length;
      const employers = filteredUsers.filter(user => user.role === 'employer').length;
      const candidates = filteredUsers.filter(user => user.role === 'applicant').length;
      
      setStatsData(prevState => ({
        ...prevState,
        users: {
          ...prevState.users,
          total: totalUsers,
          employers,
          candidates
        },
        jobs: {
          ...prevState.jobs,
          total: filteredJobs.length,
          active: filteredJobs.filter(job => job.status === 'active').length,
          applications: filteredApplications.length
        }
      }));
      
      // Process filtered data for charts
      // This would be similar to the processing done in fetchData but using the filtered arrays
      
    } catch (error) {
      handleApiError(error, 'dữ liệu theo khoảng thời gian');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = () => {
    fetchData();
    message.info('Đang tải lại dữ liệu báo cáo...');
  };
  
  const handleTabChange = (key) => {
    setActiveTab(key);
  };
  
  // Column definitions for the tables
  const employerColumns = [
    {
      title: 'Tên công ty',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số tin đăng',
      dataIndex: 'jobs',
      key: 'jobs',
      sorter: (a, b) => a.jobs - b.jobs,
    },
    {
      title: 'Số đơn ứng tuyển',
      dataIndex: 'applications',
      key: 'applications',
      sorter: (a, b) => a.applications - b.applications,
    }
  ];
  
  const jobColumns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Công ty',
      dataIndex: 'company',
      key: 'company',
    },
    {
      title: 'Số đơn ứng tuyển',
      dataIndex: 'applications',
      key: 'applications',
      sorter: (a, b) => a.applications - b.applications,
    }
  ];
  
  // Chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };
  
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: false
      }
    }
  };
  
  // Modified exportReport to handle chart-specific exports
  const exportReport = () => {
    try {
      setLoading(true);
      
      // Generate PDF report with data
      const success = generatePdfReport(
        statsData,
        userChartData,
        jobChartData,
        applicationStats,
        timeToFillData,
        topEmployers,
        topJobs
      );
      
      if (success) {
        message.success('Báo cáo đã được tạo thành công!');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error exporting report:', error);
      message.error('Có lỗi xảy ra khi xuất báo cáo. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };
  
  // Export specific chart data
  const exportChartData = (chartType) => {
    try {
      let chartRef = null;
      let filename = '';
      
      switch(chartType) {
        case 'người dùng':
          chartRef = chartRefs.userChart.current;
          filename = 'bieu-do-nguoi-dung';
          break;
        case 'tin tuyển dụng':
          chartRef = chartRefs.jobChart.current;
          filename = 'bieu-do-tin-tuyen-dung';
          break;
        case 'đơn ứng tuyển':
          chartRef = chartRefs.applicationChart.current;
          filename = 'bieu-do-don-ung-tuyen';
          break;
        default:
          message.error('Không xác định được biểu đồ cần xuất');
          return;
      }
      
      exportChartToImage(chartRef, filename);
    } catch (error) {
      console.error('Error exporting chart:', error);
      message.error(`Có lỗi xảy ra khi xuất biểu đồ ${chartType}`);
    }
  };
  
  return (
    <div className="admin-reports-page">
      <div className="reports-header d-flex justify-content-between align-items-center mb-4">
        <Title level={2}>Báo cáo & Thống kê</Title>
        
        <div className="reports-actions">
          <RangePicker 
            onChange={handleDateRangeChange} 
            value={dateRange}
            style={{ marginRight: 16 }}
            placeholder={['Từ ngày', 'Đến ngày']}
          />
          
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            style={{ marginRight: 16 }}
          >
            Làm mới
          </Button>
          
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={exportReport}
          >
            Xuất báo cáo
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}
      
      {loading ? (
        <div className="loading-container" style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" tip="Đang tải dữ liệu..." />
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <Row gutter={16} className="mb-4">
            <Col span={6}>
              <Card hoverable>
                <Statistic
                  title="Tổng người dùng"
                  value={statsData.users.total}
                  prefix={<UserOutlined />}
                  suffix={
                    <Text type="secondary" style={{ fontSize: '0.8em' }}>
                      <RiseOutlined style={{ color: '#3f8600' }} /> {statsData.users.growth}%
                    </Text>
                  }
                />
                <Text type="secondary">Tăng trưởng trong 30 ngày qua</Text>
              </Card>
            </Col>
            
            <Col span={6}>
              <Card hoverable>
                <Statistic
                  title="Nhà tuyển dụng"
                  value={statsData.users.employers}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
                <div style={{ marginTop: 5 }}>
                  <Text type="secondary">
                    {statsData.users.total > 0 ? Math.round(statsData.users.employers / statsData.users.total * 100) : 0}% tổng người dùng
                  </Text>
                </div>
              </Card>
            </Col>
            
            <Col span={6}>
              <Card hoverable>
                <Statistic
                  title="Tin tuyển dụng"
                  value={statsData.jobs.total}
                  prefix={<FileTextOutlined />}
                  suffix={
                    <Text type="secondary" style={{ fontSize: '0.8em' }}>
                      <RiseOutlined style={{ color: '#3f8600' }} /> {statsData.jobs.growth}%
                    </Text>
                  }
                />
                <Text type="secondary">{statsData.jobs.active} tin đang hoạt động</Text>
              </Card>
            </Col>
            
            <Col span={6}>
              <Card hoverable>
                <Statistic
                  title="Đơn ứng tuyển"
                  value={statsData.jobs.applications}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
                <Text type="secondary">
                  Trung bình {statsData.jobs.total > 0 ? (statsData.jobs.applications / statsData.jobs.total).toFixed(1) : 0} đơn/tin
                </Text>
              </Card>
            </Col>
          </Row>
          
          {/* Tabs for different reports */}
          <Card>
            <Tabs defaultActiveKey="1" onChange={handleTabChange}>
              <TabPane 
                tab={
                  <span>
                    <LineChartOutlined />
                    Phân tích người dùng
                  </span>
                } 
                key="1"
              >
                <UserTrendsChart 
                  userChartData={userChartData}
                  statsData={statsData}
                  timeFrame={timeFrame}
                  onTimeFrameChange={(e) => handleTimeFrameChange(e)}
                  onExportChart={() => exportChartData('người dùng')}
                  chartRef={chartRefs.userChart}
                />
                
                <Divider />
                
                <Title level={4}>Nhà tuyển dụng hàng đầu</Title>
                {topEmployers.length > 0 ? (
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <Table 
                      columns={employerColumns} 
                      dataSource={topEmployers}
                      rowKey="id"
                      pagination={false}
                    />
                  </div>
                ) : (
                  <Empty description="Không có dữ liệu nhà tuyển dụng" />
                )}
              </TabPane>
              
              <TabPane 
                tab={
                  <span>
                    <BarChartOutlined />
                    Phân tích tin đăng tuyển
                  </span>
                } 
                key="2"
              >
                <JobTrendsChart 
                  jobChartData={jobChartData}
                  statsData={statsData}
                  timeFrame={timeFrame}
                  onTimeFrameChange={(e) => handleTimeFrameChange(e)}
                  onExportChart={() => exportChartData('tin tuyển dụng')}
                  chartRef={chartRefs.jobChart}
                />
                
                <Divider />
                
                <IndustryAnalysis 
                  industryDistribution={industryDistribution}
                  timeToFillData={timeToFillData}
                  applicationStats={applicationStats}
                  loading={loading}
                />
                
                <Divider />
                
                <Title level={4}>Tin tuyển dụng hàng đầu</Title>
                {topJobs.length > 0 ? (
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <Table 
                      columns={jobColumns} 
                      dataSource={topJobs}
                      rowKey="id"
                      pagination={{ pageSize: 5 }}
                    />
                  </div>
                ) : (
                  <Empty description="Không có dữ liệu tin tuyển dụng" />
                )}
              </TabPane>
              
              <TabPane 
                tab={
                  <span>
                    <PieChartOutlined />
                    Thống kê đơn ứng tuyển
                  </span>
                } 
                key="3"
              >
                <Row gutter={24}>
                  <Col span={12}>
                    <Card title="Trạng thái đơn ứng tuyển">
                      {applicationStats.datasets[0].data.some(value => value > 0) ? (
                        <div style={{ height: 350 }}>
                          <Chart type="pie" data={applicationStats} options={pieChartOptions} />
                        </div>
                      ) : (
                        <Empty description="Không có dữ liệu đơn ứng tuyển" />
                      )}
                    </Card>
                  </Col>
                  
                  <Col span={12}>
                    <Card title="Tóm tắt đơn ứng tuyển">
                      <Statistic
                        title="Tổng đơn ứng tuyển"
                        value={statsData.jobs.applications}
                        suffix="đơn"
                      />
                      <Divider />
                      <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Statistic 
                              title="Đang chờ xử lý" 
                              value={sumChartData(applicationStats, 0, [0, 1], 0)} 
                              valueStyle={{ fontSize: '1.2em' }}
                            />
                          </Col>
                          <Col span={12}>
                            <Statistic 
                              title="Đã phỏng vấn" 
                              value={getChartData(applicationStats, 0, 2, 0)} 
                              valueStyle={{ fontSize: '1.2em', color: '#1890ff' }}
                            />
                          </Col>
                        </Row>
                        <Row gutter={16} style={{ marginTop: 16 }}>
                          <Col span={12}>
                            <Statistic 
                              title="Đã nhận việc" 
                              value={getChartData(applicationStats, 0, 3, 0)} 
                              valueStyle={{ fontSize: '1.2em', color: '#52c41a' }}
                            />
                          </Col>
                          <Col span={12}>
                            <Statistic 
                              title="Đã từ chối" 
                              value={getChartData(applicationStats, 0, 4, 0)} 
                              valueStyle={{ fontSize: '1.2em', color: '#ff4d4f' }}
                            />
                          </Col>
                        </Row>
                      </div>
                    </Card>
                  </Col>
                </Row>
                
                <Card title="Phân tích quy trình tuyển dụng" className="mt-4">
                  <div className="application-funnel-analysis" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <Row gutter={24}>
                      <Col span={12}>
                        <Card 
                          title="Tỷ lệ chuyển đổi" 
                          size="small"
                          className="mb-3"
                        >
                          <ul className="conversion-rates-list" style={{ paddingLeft: 0, listStyleType: 'none' }}>
                            <li style={{ marginBottom: 10 }}>
                              <Text>Lượt xem → Ứng tuyển: </Text>
                              <Text type={conversionData.rates.viewToApply >= 5 ? 'success' : 'warning'} strong>
                                {conversionData.rates.viewToApply}%
                              </Text>
                              {conversionData.rates.viewToApply >= 10 && <Tag color="green" style={{marginLeft: 8}}>Tốt</Tag>}
                              {conversionData.rates.viewToApply < 3 && <Tag color="orange" style={{marginLeft: 8}}>Cần cải thiện</Tag>}
                            </li>
                            <li style={{ marginBottom: 10 }}>
                              <Text>Ứng tuyển → Phỏng vấn: </Text>
                              <Text type={conversionData.rates.applyToInterview >= 20 ? 'success' : 'warning'} strong>
                                {conversionData.rates.applyToInterview}%
                              </Text>
                              {conversionData.rates.applyToInterview >= 30 && <Tag color="green" style={{marginLeft: 8}}>Tốt</Tag>}
                              {conversionData.rates.applyToInterview < 15 && <Tag color="orange" style={{marginLeft: 8}}>Cần cải thiện</Tag>}
                            </li>
                            <li>
                              <Text>Phỏng vấn → Nhận việc: </Text>
                              <Text type={conversionData.rates.interviewToHire >= 15 ? 'success' : 'warning'} strong>
                                {conversionData.rates.interviewToHire}%
                              </Text>
                              {conversionData.rates.interviewToHire >= 25 && <Tag color="green" style={{marginLeft: 8}}>Tốt</Tag>}
                              {conversionData.rates.interviewToHire < 10 && <Tag color="orange" style={{marginLeft: 8}}>Cần cải thiện</Tag>}
                            </li>
                          </ul>
                        </Card>
                      </Col>
                      <Col span={12}>
                        <Card 
                          title="Thời gian tuyển dụng trung bình" 
                          size="small"
                          className="mb-3"
                        >
                          <Statistic
                            title="Số ngày trung bình"
                            value={timeToFillData.average}
                            suffix="ngày"
                            valueStyle={{ color: timeToFillData.average > 30 ? '#faad14' : '#52c41a' }}
                          />
                          <div style={{ marginTop: 16 }}>
                            <Text type="secondary">Đánh giá: </Text>
                            {timeToFillData.average <= 20 ? (
                              <Text type="success">Thời gian tuyển dụng tốt</Text>
                            ) : timeToFillData.average <= 30 ? (
                              <Text type="warning">Thời gian tuyển dụng trong mức trung bình</Text>
                            ) : (
                              <Text type="danger">Thời gian tuyển dụng khá dài, cần cải thiện</Text>
                            )}
                          </div>
                        </Card>
                      </Col>
                    </Row>
                    <Alert
                      type="info"
                      message="Gợi ý cải thiện quy trình tuyển dụng"
                      description={
                        <div>
                          {conversionData.rates.viewToApply < 5 && (
                            <Paragraph>
                              <Text strong>Cải thiện tỷ lệ lượt xem → ứng tuyển: </Text>
                              <Text>Đảm bảo mô tả công việc rõ ràng, hấp dẫn, và dễ ứng tuyển.</Text>
                            </Paragraph>
                          )}
                          {conversionData.rates.applyToInterview < 20 && (
                            <Paragraph>
                              <Text strong>Cải thiện tỷ lệ ứng tuyển → phỏng vấn: </Text>
                              <Text>Xem xét lại quy trình sàng lọc hồ sơ, đảm bảo yêu cầu công việc phù hợp với thị trường.</Text>
                            </Paragraph>
                          )}
                          {conversionData.rates.interviewToHire < 15 && (
                            <Paragraph>
                              <Text strong>Cải thiện tỷ lệ phỏng vấn → nhận việc: </Text>
                              <Text>Kiểm tra lại quy trình phỏng vấn và đề xuất đãi ngộ cạnh tranh hơn.</Text>
                            </Paragraph>
                          )}
                          {timeToFillData.average > 30 && (
                            <Paragraph>
                              <Text strong>Giảm thời gian tuyển dụng: </Text>
                              <Text>Rút ngắn thời gian đánh giá hồ sơ và quy trình phê duyệt nội bộ.</Text>
                            </Paragraph>
                          )}
                          {(conversionData.rates.viewToApply >= 5 && 
                            conversionData.rates.applyToInterview >= 20 && 
                            conversionData.rates.interviewToHire >= 15 && 
                            timeToFillData.average <= 30) && (
                            <Paragraph>
                              <Text strong>Các chỉ số đang ở mức tốt: </Text>
                              <Text>Tiếp tục duy trì các quy trình hiện tại và theo dõi chỉ số thường xuyên.</Text>
                            </Paragraph>
                          )}
                        </div>
                      }
                    />
                  </div>
                </Card>
              </TabPane>
            </Tabs>
          </Card>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
