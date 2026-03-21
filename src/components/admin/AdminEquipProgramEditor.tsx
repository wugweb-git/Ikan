import React, { useEffect, useState } from 'react';
import { getEquipPrograms, createEquipProgram, updateEquipProgram, deleteEquipProgram } from './api';

const AdminEquipProgramEditor = () => {
    const [equipPrograms, setEquipPrograms] = useState([]);
    const [newProgram, setNewProgram] = useState({name: '', sections: []});

    useEffect(() => {
        fetchEquipPrograms();
    }, []);

    const fetchEquipPrograms = async () => {
        const programs = await getEquipPrograms();
        setEquipPrograms(programs);
    };

    const handleCreate = async () => {
        await createEquipProgram(newProgram);
        setNewProgram({name: '', sections: []});
        fetchEquipPrograms();
    };

    const handleUpdate = async (id) => {
        await updateEquipProgram(id, newProgram);
        fetchEquipPrograms();
    };

    const handleDelete = async (id) => {
        await deleteEquipProgram(id);
        fetchEquipPrograms();
    };

    return (
        <div>
            <h1>Admin Equip Program Editor</h1>
            <input 
                type="text" 
                value={newProgram.name} 
                onChange={(e) => setNewProgram({...newProgram, name: e.target.value})} 
                placeholder="Program Name"
            />
            <button onClick={handleCreate}>Create</button>
            <ul>
                {equipPrograms.map(program => (
                    <li key={program.id}>
                        {program.name} 
                        <button onClick={() => handleUpdate(program.id)}>Update</button>
                        <button onClick={() => handleDelete(program.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AdminEquipProgramEditor;