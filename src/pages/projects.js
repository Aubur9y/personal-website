import { useState, useEffect } from 'react';
import Head from 'next/head';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaGithub, FaStar, FaCodeBranch } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

export default function Projects() {
  const { translations, lang } = useLanguage();
  const { isAdmin } = useAuth();
  const [allProjects, setAllProjects] = useState([]); // 所有可选的项目
  const [displayProjects, setDisplayProjects] = useState([]); // 当前显示的项目
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProjects, setEditingProjects] = useState([]); // 编辑时的临时状态

  // 获取项目数据和配置
  const fetchData = async () => {
    try {
      const [projectsRes, configRes] = await Promise.all([
        fetch('/api/github/repos'),
        fetch('/api/projects/config')
      ]);
      
      const projectsData = await projectsRes.json();
      const configData = await configRes.json();

      if (!projectsData.success) {
        throw new Error(projectsData.message || '获取项目失败');
      }

      setAllProjects(projectsData.repos);

      // 根据配置显示项目
      const orderedProjects = configData.order && configData.order.length > 0
        ? configData.order
            .map(id => projectsData.repos.find(p => p.id === id))
            .filter(Boolean)
        : [];
      
      setDisplayProjects(orderedProjects);
      setEditingProjects(orderedProjects); // 初始化编辑状态
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(lang === 'zh' ? '加载项目失败' : 'Failed to load projects');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [lang]);

  // 切换项目选择
  const toggleProject = (project) => {
    if (editingProjects.some(p => p.id === project.id)) {
      setEditingProjects(prev => prev.filter(p => p.id !== project.id));
    } else {
      setEditingProjects(prev => [...prev, project]);
    }
  };

  // 保存配置
  const saveConfig = async () => {
    try {
      // 去重并保存
      const uniqueProjects = editingProjects.filter((project, index) => 
        editingProjects.findIndex(p => p.id === project.id) === index
      );

      await fetch('/api/projects/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedProjects: uniqueProjects.map(p => p.id),
          order: uniqueProjects.map(p => p.id)
        }),
        credentials: 'include'
      });
      
      // 更新显示
      setDisplayProjects(uniqueProjects);
      toast.success(lang === 'zh' ? '保存成功' : 'Saved successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error(lang === 'zh' ? '保存失败' : 'Failed to save');
    }
  };

  // 处理拖拽结束
  const onDragEnd = (result) => {
    if (!result.destination || !isEditing) return;

    const items = Array.from(editingProjects);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setEditingProjects(items);
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingProjects(displayProjects);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <div className="text-xl">{lang === 'zh' ? '加载中...' : 'Loading...'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>{translations.projects.title} | {translations.common.siteTitle}</title>
        <meta name="description" content={translations.projects.description} />
      </Head>

      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            {translations.projects.title}
          </h1>
          {isAdmin && (
            <div className="space-x-4">
              <button
                onClick={() => isEditing ? cancelEdit() : setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                {isEditing ? (translations.common.cancel) : (translations.common.edit)}
              </button>
              {isEditing && (
                <button
                  onClick={saveConfig}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                >
                  {translations.common.save}
                </button>
              )}
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allProjects.map(project => (
              <div
                key={project.id}
                className={`p-6 rounded-lg border-2 transition-colors cursor-pointer ${
                  editingProjects.some(p => p.id === project.id)
                    ? 'border-blue-500 bg-gray-800'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-500'
                }`}
                onClick={() => toggleProject(project)}
              >
                <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
                <p className="text-gray-400 mb-4">{project.description}</p>
                <div className="flex items-center space-x-4 text-gray-400">
                  <span className="flex items-center">
                    <FaStar className="mr-1" /> {project.stars}
                  </span>
                  <span className="flex items-center">
                    <FaCodeBranch className="mr-1" /> {project.forks}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="projects" isDropDisabled={!isEditing}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {(isEditing ? editingProjects : displayProjects).map((project, index) => (
                    <Draggable
                      key={project.id}
                      draggableId={project.id.toString()}
                      index={index}
                      isDragDisabled={!isEditing}
                    >
                      {(provided, snapshot) => (
                        <motion.div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-6 rounded-lg bg-gray-800 border-2 ${
                            snapshot.isDragging ? 'border-blue-500' : 'border-gray-700'
                          }`}
                        >
                          <h3 className="text-xl font-semibold mb-2">
                            <a
                              href={project.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-blue-400 transition-colors flex items-center"
                            >
                              <FaGithub className="mr-2" />
                              {project.name}
                            </a>
                          </h3>
                          <p className="text-gray-400 mb-4">{project.description}</p>
                          <div className="flex items-center space-x-4 text-gray-400">
                            <span className="flex items-center">
                              <FaStar className="mr-1" /> {project.stars}
                            </span>
                            <span className="flex items-center">
                              <FaCodeBranch className="mr-1" /> {project.forks}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </main>
    </div>
  );
} 