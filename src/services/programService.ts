import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-supabase-key';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Fetch all programs.
 */
export const fetchPrograms = async () => {
    try {
        const { data, error } = await supabase.from('programs').select('*');
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching programs:', error);
        throw error;
    }
};

/**
 * Create a new program.
 * @param {Object} data - The program data.
 */
export const createProgram = async (data) => {
    try {
        const { data: newProgram, error } = await supabase.from('programs').insert([data]);
        if (error) throw error;
        return newProgram;
    } catch (error) {
        console.error('Error creating program:', error);
        throw error;
    }
};

/**
 * Update an existing program.
 * @param {number} id - The ID of the program to update.
 * @param {Object} data - The new data for the program.
 */
export const updateProgram = async (id, data) => {
    try {
        const { data: updatedProgram, error } = await supabase.from('programs').update(data).match({ id });
        if (error) throw error;
        return updatedProgram;
    } catch (error) {
        console.error('Error updating program:', error);
        throw error;
    }
};

/**
 * Delete a program.
 * @param {number} id - The ID of the program to delete.
 */
export const deleteProgram = async (id) => {
    try {
        const { data, error } = await supabase.from('programs').delete().match({ id });
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error deleting program:', error);
        throw error;
    }
};

/**
 * Add a section to a program.
 * @param {number} programId - The ID of the program.
 * @param {Object} sectionData - The section data to add.
 */
export const addSection = async (programId, sectionData) => {
    try {
        const { data, error } = await supabase.from('sections').insert([{ ...sectionData, program_id: programId }]);
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error adding section:', error);
        throw error;
    }
};

/**
 * Remove a section from a program.
 * @param {number} programId - The ID of the program.
 * @param {number} sectionId - The ID of the section to remove.
 */
export const removeSection = async (programId, sectionId) => {
    try {
        const { data, error } = await supabase.from('sections').delete().match({ id: sectionId, program_id: programId });
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error removing section:', error);
        throw error;
    }
};

/**
 * Add a block to a section.
 * @param {number} programId - The ID of the program.
 * @param {number} sectionId - The ID of the section.
 * @param {Object} blockData - The block data to add.
 */
export const addBlockToSection = async (programId, sectionId, blockData) => {
    try {
        const { data, error } = await supabase.from('blocks').insert([{ ...blockData, section_id: sectionId, program_id: programId }]);
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error adding block to section:', error);
        throw error;
    }
};

/**
 * Remove a block from a section.
 * @param {number} programId - The ID of the program.
 * @param {number} sectionId - The ID of the section.
 * @param {number} blockId - The ID of the block to remove.
 */
export const removeBlockFromSection = async (programId, sectionId, blockId) => {
    try {
        const { data, error } = await supabase.from('blocks').delete().match({ id: blockId, section_id: sectionId, program_id: programId });
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error removing block from section:', error);
        throw error;
    }
};

/**
 * Reorder sections within a program.
 * @param {number} programId - The ID of the program.
 * @param {Array} sections - An array of section IDs in the new order.
 */
export const reorderSections = async (programId, sections) => {
    try {
        const updates = sections.map((sectionId, index) => ({ id: sectionId, order: index }));
        const { data, error } = await supabase.from('sections').upsert(updates);
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error reordering sections:', error);
        throw error;
    }
};
