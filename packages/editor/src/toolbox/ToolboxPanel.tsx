import { Tabs, TabsContent, TabsList, TabsTrigger } from '@parama-ui/react';
import { useEditor } from '../store/useEditor';
import { ToolboxList } from './ToolboxList';
import { PresetManager } from './PresetManager';
import { useState } from 'react';
import { PresetTypeDef } from '@form-builder/types';

export const ToolboxPanel = () => {
  const { toolbox, editor } = useEditor();
  const [filteredPresets, setFilteredPresets] = useState<PresetTypeDef[]>(toolbox.presets);

  // Handle preset filtering from PresetManager
  const handleFilteredPresets = (presets: PresetTypeDef[]) => {
    setFilteredPresets(presets);
  };

  // Optional preset creation handler
  const handleCreatePreset = () => {
    console.log('Create new preset functionality would be implemented here');
    // This could open a dialog or navigate to a preset creation interface
  };

  // Optional preset import handler
  const handleImportPresets = () => {
    console.log('Import presets functionality would be implemented here');
    // This could open a file dialog to import preset files
  };

  return (
    <div
      id="toolbox"
      className="w-80 shrink-0 max-h-screen overflow-y-auto overflow-x-hidden bg-gray-50 border-r-2 border-gray-100/60">
      <Tabs defaultValue="fields">
        <TabsList className="rounded-none grid-cols-2 h-12 bg-gray-50 border-b border-gray-200">
          <TabsTrigger
            className="h-full rounded-md border-transparent data-[state=active]:border data-[state=active]:border-gray-100"
            value="fields">
            Fields
          </TabsTrigger>
          <TabsTrigger
            className="h-full rounded-md border-transparent data-[state=active]:border data-[state=active]:border-gray-100"
            value="presets">
            Presets
          </TabsTrigger>
        </TabsList>
        <TabsContent value="fields">
          <ToolboxList items={toolbox.fields} showSearch={true} searchPlaceholder="Search fields..." />
        </TabsContent>
        <TabsContent value="presets">
          {/* Enhanced preset management */}
          <PresetManager
            presets={toolbox.presets}
            onFilteredPresets={handleFilteredPresets}
            onCreatePreset={handleCreatePreset}
            onImportPresets={handleImportPresets}
            showActions={true}
          />
          <ToolboxList
            items={filteredPresets}
            showSearch={false} // Disable built-in search since PresetManager handles it
            searchPlaceholder="Search presets..."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
