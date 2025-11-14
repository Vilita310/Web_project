// 测试课程动态加载
import { getAllCourses, getLearningPaths, loadCourseData, getCourseStats } from './utils/courseLoader.js';

async function testCourseLoader() {
  console.log('=== 测试课程动态化加载 ===\n');

  try {
    // 1. 测试获取所有课程
    console.log('1. 获取所有课程配置:');
    const allCourses = getAllCourses();
    console.log(`   找到 ${allCourses.length} 个课程:`);
    allCourses.forEach(course => {
      console.log(`   - ${course.id}: ${course.title} (${course.level})`);
    });
    console.log('');

    // 2. 测试获取学习路径
    console.log('2. 获取学习路径:');
    const paths = getLearningPaths();
    Object.keys(paths).forEach(pathId => {
      const path = paths[pathId];
      console.log(`   - ${pathId}: ${path.title} (${path.courses.length} 个课程)`);
    });
    console.log('');

    // 3. 测试课程统计
    console.log('3. 课程统计:');
    const stats = getCourseStats();
    console.log(`   - 总课程数: ${stats.totalCourses}`);
    console.log(`   - 总课时数: ${stats.totalLessons}`);
    console.log(`   - 总时长: ${stats.totalDuration}小时`);
    console.log(`   - 课程类别: ${stats.categories.join(', ')}`);
    console.log(`   - 平均评分: ${stats.avgRating.toFixed(1)}`);
    console.log('');

    // 4. 测试动态加载具体课程数据
    console.log('4. 测试动态加载课程数据:');
    const testCourses = ['javascript-basics', 'react-fullstack', 'python-basics'];

    for (const courseId of testCourses) {
      try {
        console.log(`   加载课程: ${courseId}`);
        const courseData = await loadCourseData(courseId);
        console.log(`     ✓ 配置: ${courseData.config.title}`);
        console.log(`     ✓ 课程数: ${courseData.lessons.length}`);

        if (courseData.lessons.length > 0) {
          const firstLesson = courseData.lessons[0];
          console.log(`     ✓ 第一课: ${firstLesson.meta.title}`);
        }
      } catch (error) {
        console.log(`     ✗ 加载失败: ${error.message}`);
      }
    }
    console.log('');

    console.log('=== 课程动态化测试完成 ===');
    return {
      success: true,
      coursesCount: allCourses.length,
      pathsCount: Object.keys(paths).length,
      stats
    };

  } catch (error) {
    console.error('测试失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 如果直接运行此文件，执行测试
if (typeof window === 'undefined') {
  testCourseLoader().then(result => {
    console.log('\n测试结果:', result);
  });
}

export { testCourseLoader };