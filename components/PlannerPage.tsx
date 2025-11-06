import React, { useState } from 'react';
import { WidgetCard } from './WidgetCard';
import { PlannerIcon } from './Icons';
import { TimeBlockCalendar } from './TimeBlockCalendar';
import type { Task } from '../App';

export const PlannerPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const loadTasks = (): Task[] => {
    try {
      return JSON.parse(localStorage.getItem('tasks') || '[]');
    } catch {
      return [];
    }
  };

  const loadProjects = () => {
    try {
      return JSON.parse(localStorage.getItem('projects') || '[]');
    } catch {
      return [];
    }
  };

  const tasks = loadTasks();
  const projects = loadProjects();

  const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  const todayTasks = tasks.filter(task => task.dueDate === dateStr);
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < new Date(dateStr);
  });
  const upcomingTasks = tasks.filter(task => {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) > new Date(dateStr);
  }).slice(0, 5);

  const activeProjects = projects.filter((p: any) => p.status === 'in-progress').slice(0, 3);

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const goToToday = () => setSelectedDate(new Date());

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <div className="space-y-6">
      <WidgetCard>
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <PlannerIcon className="w-8 h-8 text-accent" />
              <div>
                <h2 className="text-3xl font-bold text-text-primary">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h2>
                <p className="text-sm text-text-secondary mt-1">{todayTasks.length} tasks scheduled</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={goToToday} className="px-4 py-2 bg-accent text-white rounded-lg font-semibold hover:bg-accent-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent">Today</button>
              <button onClick={goToPreviousDay} className="p-2 bg-black/5 dark:bg-white/5 text-text-primary rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-accent">←</button>
              <button onClick={goToNextDay} className="p-2 bg-black/5 dark:bg-white/5 text-text-primary rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-accent">→</button>
            </div>
          </div>
        </div>
      </WidgetCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {overdueTasks.length > 0 && (
            <WidgetCard>
              <div className="p-6">
                <h3 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-2">⚠️ Overdue Tasks ({overdueTasks.length})</h3>
                <div className="space-y-2">
                  {overdueTasks.map(task => (
                    <div key={task.id} className="p-3 rounded-lg bg-red-500/10 border-l-4 border-red-500">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-text-primary">{task.title}</h4>
                          <p className="text-xs text-text-secondary mt-1">Due: {new Date(task.dueDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        </div>
                        <div className="flex gap-1">
                          {task.urgent && <span className="px-2 py-0.5 bg-red-500/20 text-red-600 text-xs rounded">Urgent</span>}
                          {task.important && <span className="px-2 py-0.5 bg-blue-500/20 text-blue-600 text-xs rounded">Important</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </WidgetCard>
          )}

          <WidgetCard>
            <div className="p-6">
              <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                📋 {isToday ? 'Today' : selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}'s Schedule
              </h3>
              {todayTasks.length > 0 ? (
                <div className="space-y-2">
                  {todayTasks.map(task => (
                    <div key={task.id} className={`p-3 rounded-lg border-l-4 ${task.completed ? 'bg-green-500/10 border-green-500' : task.urgent ? 'bg-red-500/10 border-red-500' : task.important ? 'bg-blue-500/10 border-blue-500' : 'bg-accent/10 border-accent'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className={`font-semibold text-text-primary ${task.completed ? 'line-through' : ''}`}>{task.title}</h4>
                          {task.dueTime && <p className="text-xs text-text-secondary mt-1">{new Date(`2000-01-01T${task.dueTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>}
                        </div>
                        <div className="flex gap-1">
                          {task.urgent && <span className="px-2 py-0.5 bg-red-500/20 text-red-600 text-xs rounded">Urgent</span>}
                          {task.important && <span className="px-2 py-0.5 bg-blue-500/20 text-blue-600 text-xs rounded">Important</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-text-secondary">
                  <PlannerIcon className="w-16 h-16 mx-auto mb-3 opacity-50" />
                  <p>No tasks scheduled for this day</p>
                </div>
              )}
            </div>
          </WidgetCard>

          <TimeBlockCalendar
            tasks={todayTasks}
            selectedDate={selectedDate}
          />
        </div>

        <div className="lg:col-span-1 space-y-6">
          <WidgetCard>
            <div className="p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">Upcoming Tasks</h3>
              <div className="space-y-2">
                {upcomingTasks.map(task => (
                  <div key={task.id} className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                    <p className="text-sm font-medium text-text-primary">{task.title}</p>
                    <p className="text-xs text-text-secondary mt-1">{task.dueDate && new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                ))}
                {upcomingTasks.length === 0 && <p className="text-sm text-text-secondary text-center py-4">No upcoming tasks</p>}
              </div>
            </div>
          </WidgetCard>

          <WidgetCard>
            <div className="p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">Active Projects</h3>
              <div className="space-y-2">
                {activeProjects.map((project: any) => (
                  <div key={project.id} className="p-3 rounded-lg bg-purple-500/10 border-l-4 border-purple-500">
                    <h4 className="font-semibold text-text-primary">{project.name}</h4>
                    {project.description && <p className="text-xs text-text-secondary mt-1 line-clamp-2">{project.description}</p>}
                  </div>
                ))}
                {activeProjects.length === 0 && <p className="text-sm text-text-secondary text-center py-4">No active projects</p>}
              </div>
            </div>
          </WidgetCard>

          <WidgetCard>
            <div className="p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">Focus Stats</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-blue-500/10 text-center">
                  <div className="text-3xl font-bold text-blue-500">{todayTasks.filter(t => t.completed).length}/{todayTasks.length}</div>
                  <div className="text-xs text-text-secondary mt-1">Tasks Completed</div>
                </div>
                <div className="p-3 rounded-lg bg-accent/10 text-center">
                  <div className="text-3xl font-bold text-accent">{todayTasks.filter(t => !t.completed && (t.urgent || t.important)).length}</div>
                  <div className="text-xs text-text-secondary mt-1">Priority Tasks</div>
                </div>
              </div>
            </div>
          </WidgetCard>
        </div>
      </div>
    </div>
  );
};