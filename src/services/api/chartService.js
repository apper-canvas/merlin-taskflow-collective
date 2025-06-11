// Chart data processing and configuration service
import { format, subDays, eachDayOfInterval } from 'date-fns';

// Simulate historical spend data for line charts
const generateSpendHistory = (projects) => {
  const endDate = new Date();
  const startDate = subDays(endDate, 90); // Last 90 days
  const dates = eachDayOfInterval({ start: startDate, end: endDate });
  
  return dates.map(date => {
    const dayOffset = Math.floor((date - startDate) / (1000 * 60 * 60 * 24));
    const actualSpend = projects.reduce((sum, project) => {
      // Simulate gradual spend increase over time
      const projectDuration = new Date(project.endDate) - new Date(project.startDate);
      const projectProgress = Math.min(1, (date - new Date(project.startDate)) / projectDuration);
      const dailySpend = projectProgress > 0 ? (project.actualSpend * projectProgress) / dayOffset : 0;
      return sum + Math.max(0, dailySpend);
    }, 0);
    
    const plannedSpend = projects.reduce((sum, project) => {
      const projectDuration = new Date(project.endDate) - new Date(project.startDate);
      const projectProgress = Math.min(1, (date - new Date(project.startDate)) / projectDuration);
      const dailySpend = projectProgress > 0 ? (project.budget * projectProgress) / dayOffset : 0;
      return sum + Math.max(0, dailySpend);
    }, 0);
    
    return {
      date: format(date, 'MMM dd'),
      actualSpend: Math.round(actualSpend),
      plannedSpend: Math.round(plannedSpend)
    };
  });
};

// Process project status distribution data
export const getStatusDistributionData = (projects) => {
  const statusCounts = projects.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1;
    return acc;
  }, {});
  
  const statusLabels = {
    active: 'Active',
    completed: 'Completed',
    'on-hold': 'On Hold',
    cancelled: 'Cancelled'
  };
  
  return Object.entries(statusCounts).map(([status, count]) => ({
    status: statusLabels[status] || status,
    count,
    projects: projects.filter(p => p.status === status)
  }));
};

// Process budget allocation data for pie chart
export const getBudgetAllocationData = (projects) => {
  return projects.map(project => ({
    name: project.name,
    value: project.budget,
    percentage: 0, // Will be calculated by chart component
    project
  }));
};

// Get spend tracking data for line chart
export const getSpendTrackingData = (projects) => {
  return generateSpendHistory(projects);
};

// Chart color palettes
export const chartColors = {
  primary: ['#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B', '#10B981'],
  status: {
    active: '#10B981',
    completed: '#3B82F6',
    'on-hold': '#F59E0B',
    cancelled: '#EF4444'
  }
};

// Export chart as image
export const exportChartAsImage = async (chartRef, filename = 'chart') => {
  if (!chartRef.current) return;
  
  try {
    // For ApexCharts, use built-in export functionality
    if (chartRef.current.chart) {
      await chartRef.current.chart.dataURI().then((uri) => {
        const link = document.createElement('a');
        link.href = uri.imgURI;
        link.download = `${filename}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }
  } catch (error) {
    console.error('Error exporting chart:', error);
    throw new Error('Failed to export chart');
  }
};

// Export data as CSV
export const exportDataAsCSV = (data, filename = 'data') => {
  try {
    let csvContent = '';
    
    if (Array.isArray(data) && data.length > 0) {
      // Get headers from first object
      const headers = Object.keys(data[0]);
      csvContent += headers.join(',') + '\n';
      
      // Add data rows
      data.forEach(row => {
        const values = headers.map(header => {
          const value = row[header];
          // Handle nested objects and arrays
          if (typeof value === 'object' && value !== null) {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          return `"${value || ''}"`;
        });
        csvContent += values.join(',') + '\n';
      });
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw new Error('Failed to export data');
  }
};

// Chart configuration templates
export const getBarChartConfig = (data, onElementClick) => ({
  chart: {
    type: 'bar',
    height: 350,
    toolbar: {
      show: true,
      tools: {
        download: true,
        selection: false,
        zoom: false,
        zoomin: false,
        zoomout: false,
        pan: false,
        reset: false
      }
    },
    events: {
      dataPointSelection: (event, chartContext, config) => {
        if (onElementClick) {
          const dataIndex = config.dataPointIndex;
          onElementClick(data[dataIndex]);
        }
      }
    }
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      endingShape: 'rounded',
      distributed: true
    }
  },
  dataLabels: {
    enabled: true
  },
  colors: Object.values(chartColors.status),
  series: [{
    name: 'Projects',
    data: data.map(item => item.count)
  }],
  xaxis: {
    categories: data.map(item => item.status),
    title: {
      text: 'Status'
    }
  },
  yaxis: {
    title: {
      text: 'Number of Projects'
    }
  },
  tooltip: {
    y: {
      formatter: (val) => `${val} project${val !== 1 ? 's' : ''}`
    }
  },
  responsive: [{
    breakpoint: 768,
    options: {
      chart: {
        height: 300
      },
      plotOptions: {
        bar: {
          columnWidth: '70%'
        }
      }
    }
  }]
});

export const getPieChartConfig = (data, onElementClick) => ({
  chart: {
    type: 'pie',
    height: 350,
    toolbar: {
      show: true
    },
    events: {
      dataPointSelection: (event, chartContext, config) => {
        if (onElementClick) {
          const dataIndex = config.dataPointIndex;
          onElementClick(data[dataIndex]);
        }
      }
    }
  },
  series: data.map(item => item.value),
  labels: data.map(item => item.name),
  colors: chartColors.primary,
  dataLabels: {
    enabled: true,
    formatter: (val) => `${val.toFixed(1)}%`
  },
  tooltip: {
    y: {
      formatter: (val) => `$${val.toLocaleString()}`
    }
  },
  legend: {
    position: 'bottom'
  },
  responsive: [{
    breakpoint: 768,
    options: {
      chart: {
        height: 300
      },
      legend: {
        position: 'bottom'
      }
    }
  }]
});

export const getLineChartConfig = (data) => ({
  chart: {
    type: 'line',
    height: 350,
    toolbar: {
      show: true
    }
  },
  series: [
    {
      name: 'Actual Spend',
      data: data.map(item => item.actualSpend),
      color: '#EF4444'
    },
    {
      name: 'Planned Spend',
      data: data.map(item => item.plannedSpend),
      color: '#3B82F6'
    }
  ],
  xaxis: {
    categories: data.map(item => item.date),
    title: {
      text: 'Date'
    }
  },
  yaxis: {
    title: {
      text: 'Amount ($)'
    },
    labels: {
      formatter: (val) => `$${val.toLocaleString()}`
    }
  },
  stroke: {
    curve: 'smooth',
    width: 2
  },
  markers: {
    size: 4
  },
  tooltip: {
    y: {
      formatter: (val) => `$${val.toLocaleString()}`
    }
  },
  legend: {
    position: 'top'
  },
  responsive: [{
    breakpoint: 768,
    options: {
      chart: {
        height: 300
      }
    }
  }]
});

export const chartService = {
  getStatusDistributionData,
  getBudgetAllocationData,
  getSpendTrackingData,
  exportChartAsImage,
  exportDataAsCSV,
  getBarChartConfig,
  getPieChartConfig,
  getLineChartConfig,
  chartColors
};