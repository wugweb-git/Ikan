// NEW STEP 4: DAILY PROGRAM BUILDER - BLOCK-BASED MENTAL MODEL

{/* Step 4: Daily Program Builder */}
{currentStep === 3 && (
  <div className="flex gap-6" style={{ minHeight: '600px' }}>
    {/* LEFT SIDEBAR: Day Navigator */}
    <div 
      className="flex-shrink-0" 
      style={{ 
        width: '240px',
        borderRight: '1px solid var(--color-border-default)',
        paddingRight: 'var(--spacing-4)'
      }}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-4">
          <h3 style={{
            fontSize: '14px',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Program Days
          </h3>
          <Button
            size="sm"
            onClick={() => {
              const nextDay = (formData.daily_content || []).length + 1;
              const newDay = {
                day: nextDay,
                title: `Day ${nextDay}`,
                description: '',
                activities: []
              };
              setFormData({
                ...formData,
                daily_content: [...(formData.daily_content || []), newDay]
              });
              setSelectedDayIndex(formData.daily_content?.length || 0);
            }}
            style={{
              height: '32px',
              padding: '0 var(--spacing-3)',
              gap: 'var(--spacing-1)'
            }}
          >
            <Plus className="w-3 h-3" />
            Add
          </Button>
        </div>

        {/* Day List */}
        <div className="space-y-1">
          {(formData.daily_content || []).length === 0 ? (
            <div className="text-center py-8">
              <LayoutList className="w-8 h-8 mx-auto mb-2" style={{ color: '#9CA3AF' }} />
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                No days yet.<br />Click Add to start.
              </p>
            </div>
          ) : (
            (formData.daily_content || []).map((day, index) => {
              const totalTime = day.activities.reduce((sum, act) => sum + (act.duration || 0), 0);
              const isSelected = selectedDayIndex === index;
              
              return (
                <button
                  key={day.day}
                  onClick={() => setSelectedDayIndex(index)}
                  className="w-full text-left transition-all"
                  style={{
                    padding: 'var(--spacing-3)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected ? 'var(--color-primary-default)' : 'transparent',
                    color: isSelected ? '#FFFFFF' : 'var(--color-text-primary)',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--color-primary-default)' : 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 'var(--font-weight-medium)',
                        marginBottom: '2px'
                      }}>
                        Day {day.day}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        opacity: 0.8
                      }}>
                        {day.activities.length} blocks • {totalTime} min
                      </div>
                    </div>
                    {day.activities.length === 0 && (
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: isSelected ? '#FFFFFF' : '#EF4444'
                      }} />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>

    {/* MAIN CANVAS: Day Editor */}
    <div className="flex-1">
      {(formData.daily_content || []).length === 0 ? (
        <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4" style={{ color: '#9CA3AF' }} />
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'var(--font-weight-medium)',
              marginBottom: 'var(--spacing-2)'
            }}>
              No days configured
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-4)' }}>
              Click "Add" in the sidebar to create your first day
            </p>
          </div>
        </div>
      ) : (
        (() => {
          const selectedDay = (formData.daily_content || [])[selectedDayIndex];
          if (!selectedDay) return null;

          const totalTime = selectedDay.activities.reduce((sum, act) => sum + (act.duration || 0), 0);
          const blockTypeOptions = [
            { value: 'lesson', label: 'Lesson', icon: '📚', color: '#3B82F6' },
            { value: 'exercise', label: 'Exercise', icon: '✏️', color: '#10B981' },
            { value: 'journal', label: 'Journal', icon: '📝', color: '#F59E0B' },
            { value: 'checklist', label: 'Checklist', icon: '☑️', color: '#8B5CF6' },
            { value: 'reflection', label: 'Reflection', icon: '💭', color: '#EC4899' },
            { value: 'conclude', label: 'Conclude', icon: '🎯', color: '#6366F1' }
          ];

          const getBlockColor = (type: string) => {
            return blockTypeOptions.find(opt => opt.value === type)?.color || '#6B7280';
          };

          const getBlockIcon = (type: string) => {
            return blockTypeOptions.find(opt => opt.value === type)?.icon || '📄';
          };

          const addBlock = (type: Activity['type']) => {
            const newBlock: Activity = {
              id: `block_${Date.now()}`,
              title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
              type,
              content: '',
              duration: 5,
              required: true,
              order: selectedDay.activities.length,
              data_id: ''
            };

            const updatedDays = [...(formData.daily_content || [])];
            updatedDays[selectedDayIndex] = {
              ...selectedDay,
              activities: [...selectedDay.activities, newBlock]
            };

            setFormData({ ...formData, daily_content: updatedDays });
          };

          const updateBlock = (blockId: string, updates: Partial<Activity>) => {
            const updatedActivities = selectedDay.activities.map(act =>
              act.id === blockId ? { ...act, ...updates } : act
            );

            const updatedDays = [...(formData.daily_content || [])];
            updatedDays[selectedDayIndex] = {
              ...selectedDay,
              activities: updatedActivities
            };

            setFormData({ ...formData, daily_content: updatedDays });
          };

          const deleteBlock = (blockId: string) => {
            const updatedActivities = selectedDay.activities
              .filter(act => act.id !== blockId)
              .map((act, index) => ({ ...act, order: index }));

            const updatedDays = [...(formData.daily_content || [])];
            updatedDays[selectedDayIndex] = {
              ...selectedDay,
              activities: updatedActivities
            };

            setFormData({ ...formData, daily_content: updatedDays });
          };

          const duplicateBlock = (blockId: string) => {
            const original = selectedDay.activities.find(act => act.id === blockId);
            if (!original) return;

            const duplicate: Activity = {
              ...original,
              id: `block_${Date.now()}`,
              title: `${original.title} (Copy)`,
              order: selectedDay.activities.length
            };

            const updatedDays = [...(formData.daily_content || [])];
            updatedDays[selectedDayIndex] = {
              ...selectedDay,
              activities: [...selectedDay.activities, duplicate]
            };

            setFormData({ ...formData, daily_content: updatedDays });
          };

          const moveBlock = (blockId: string, direction: 'up' | 'down') => {
            const currentIndex = selectedDay.activities.findIndex(act => act.id === blockId);
            if (currentIndex === -1) return;

            const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
            if (newIndex < 0 || newIndex >= selectedDay.activities.length) return;

            const reordered = [...selectedDay.activities];
            [reordered[currentIndex], reordered[newIndex]] = [reordered[newIndex], reordered[currentIndex]];
            
            // Update order numbers
            const withUpdatedOrders = reordered.map((act, index) => ({ ...act, order: index }));

            const updatedDays = [...(formData.daily_content || [])];
            updatedDays[selectedDayIndex] = {
              ...selectedDay,
              activities: withUpdatedOrders
            };

            setFormData({ ...formData, daily_content: updatedDays });
          };

          return (
            <div className="space-y-6">
              {/* Day Header */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--color-primary-default)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 'var(--font-weight-medium)'
                  }}>
                    {selectedDay.day}
                  </div>
                  <div className="flex-1">
                    <Input
                      value={selectedDay.title}
                      onChange={(e) => {
                        const updatedDays = [...(formData.daily_content || [])];
                        updatedDays[selectedDayIndex] = {
                          ...selectedDay,
                          title: e.target.value
                        };
                        setFormData({ ...formData, daily_content: updatedDays });
                      }}
                      placeholder="Day title"
                      style={{
                        fontSize: '18px',
                        fontWeight: 'var(--font-weight-medium)',
                        border: 'none',
                        backgroundColor: 'transparent',
                        padding: '0'
                      }}
                    />
                    <div style={{
                      fontSize: '13px',
                      color: 'var(--color-text-muted)',
                      marginTop: '4px'
                    }}>
                      ⏱ {totalTime} min total • {selectedDay.activities.length} blocks
                    </div>
                  </div>
                </div>

                {/* Delete Day Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const updatedDays = (formData.daily_content || [])
                      .filter((_, index) => index !== selectedDayIndex)
                      .map((day, index) => ({ ...day, day: index + 1 }));
                    
                    setFormData({ ...formData, daily_content: updatedDays });
                    setSelectedDayIndex(Math.max(0, selectedDayIndex - 1));
                  }}
                  style={{
                    color: '#EF4444',
                    borderColor: '#EF4444'
                  }}
                >
                  <Trash2 className="w-3 h-3 mr-2" />
                  Delete Day
                </Button>
              </div>

              {/* Block Stack */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Block Stack
                  </h4>
                </div>

                {/* Block List */}
                {selectedDay.activities.length === 0 ? (
                  <Card className="p-8 text-center" style={{ backgroundColor: '#F9FAFB' }}>
                    <LayoutList className="w-10 h-10 mx-auto mb-3" style={{ color: '#9CA3AF' }} />
                    <p style={{
                      fontSize: '14px',
                      fontWeight: 'var(--font-weight-medium)',
                      marginBottom: 'var(--spacing-2)'
                    }}>
                      No blocks yet
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      Click a block type below to start composing this day's experience
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {selectedDay.activities
                      .sort((a, b) => a.order - b.order)
                      .map((block, index) => (
                        <Card
                          key={block.id}
                          style={{
                            borderLeft: `4px solid ${getBlockColor(block.type)}`,
                            backgroundColor: '#FFFFFF'
                          }}
                        >
                          <CardContent className="pt-4 space-y-3">
                            {/* Block Header */}
                            <div className="flex items-start gap-3">
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: `${getBlockColor(block.type)}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '20px',
                                flexShrink: 0
                              }}>
                                {getBlockIcon(block.type)}
                              </div>

                              <div className="flex-1 min-w-0">
                                {/* Block Title */}
                                <Input
                                  value={block.title}
                                  onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                                  placeholder="Block title"
                                  style={{
                                    fontSize: '15px',
                                    fontWeight: 'var(--font-weight-medium)',
                                    marginBottom: 'var(--spacing-2)'
                                  }}
                                />

                                {/* Block Type & Controls */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Select
                                    value={block.type}
                                    onValueChange={(value) => updateBlock(block.id, { type: value as Activity['type'] })}
                                  >
                                    <SelectTrigger style={{ width: '140px', height: '32px' }}>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {blockTypeOptions.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                          {opt.icon} {opt.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>

                                  {/* Duration */}
                                  <div className="flex items-center gap-1">
                                    <Input
                                      type="number"
                                      value={block.duration}
                                      onChange={(e) => updateBlock(block.id, { duration: parseInt(e.target.value) || 0 })}
                                      style={{ width: '60px', height: '32px' }}
                                      min={0}
                                    />
                                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>min</span>
                                  </div>

                                  {/* Required Toggle */}
                                  <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                                    <Checkbox
                                      checked={block.required}
                                      onCheckedChange={(checked) => updateBlock(block.id, { required: checked as boolean })}
                                    />
                                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Required</span>
                                  </label>

                                  {/* Data ID */}
                                  <Input
                                    value={block.data_id || ''}
                                    onChange={(e) => updateBlock(block.id, { data_id: e.target.value })}
                                    placeholder="Data ID (i01-i12)"
                                    style={{ width: '120px', height: '32px' }}
                                  />
                                </div>
                              </div>

                              {/* Block Actions */}
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveBlock(block.id, 'up')}
                                  disabled={index === 0}
                                  style={{ width: '32px', height: '32px', padding: '0' }}
                                >
                                  <ChevronUp className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveBlock(block.id, 'down')}
                                  disabled={index === selectedDay.activities.length - 1}
                                  style={{ width: '32px', height: '32px', padding: '0' }}
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Block Content */}
                            <Textarea
                              value={block.content}
                              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                              placeholder="Block content, instructions, or prompt..."
                              rows={3}
                            />

                            {/* Bottom Actions */}
                            <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--color-border-default)' }}>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => duplicateBlock(block.id)}
                                  style={{ fontSize: '12px' }}
                                >
                                  <Save className="w-3 h-3 mr-1" />
                                  Duplicate
                                </Button>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteBlock(block.id)}
                                style={{ color: '#EF4444', fontSize: '12px' }}
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}

                {/* Add Block Buttons */}
                <div className="grid grid-cols-3 gap-2 pt-4">
                  {blockTypeOptions.map(option => (
                    <Button
                      key={option.value}
                      variant="outline"
                      onClick={() => addBlock(option.value as Activity['type'])}
                      style={{
                        height: '56px',
                        flexDirection: 'column',
                        gap: 'var(--spacing-1)',
                        borderColor: option.color,
                        borderWidth: '2px'
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>{option.icon}</span>
                      <span style={{ fontSize: '11px', fontWeight: 'var(--font-weight-medium)' }}>
                        {option.label}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          );
        })()
      )}
    </div>
  </div>
)}
