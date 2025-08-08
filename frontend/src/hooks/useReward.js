import { useDispatch, useSelector } from 'react-redux';
import {
    fetchRewardPrograms,
    fetchRewardProgramById,
    fetchRewardProgramsByType,
    createRewardProgram,
    updateRewardProgram,
    deleteRewardProgram,
    activateRewardProgram,
    deactivateRewardProgram,
    fetchRewardProgramStats,
    clearRewardProgramError,
    clearRewardProgramSuccess,
    clearSelectedRewardProgram,
    selectRewardPrograms,
    selectSelectedRewardProgram,
    selectRewardProgramStats,
    selectRewardProgramsLoading,
    selectRewardProgramsError,
    selectRewardProgramsSuccess
} from '../store/slices/rewardSlice';

export const useRewardPrograms = () => {
    const dispatch = useDispatch();

    // Selectors
    const programs = useSelector(selectRewardPrograms);
    const selectedProgram = useSelector(selectSelectedRewardProgram);
    const stats = useSelector(selectRewardProgramStats);
    const loading = useSelector(selectRewardProgramsLoading);
    const error = useSelector(selectRewardProgramsError);
    const success = useSelector(selectRewardProgramsSuccess);

    // Action dispatchers
    const loadPrograms = () => dispatch(fetchRewardPrograms());
    const loadProgramsByType = (type) => dispatch(fetchRewardProgramsByType(type));
    const loadProgramById = (id) => dispatch(fetchRewardProgramById(id));
    const loadStats = () => dispatch(fetchRewardProgramStats());

    const createProgram = (data) => dispatch(createRewardProgram(data));
    const updateProgram = (id, data) => dispatch(updateRewardProgram({ id, data }));
    const removeProgram = (id) => dispatch(deleteRewardProgram(id));
    const activateProgram = (id) => dispatch(activateRewardProgram(id));
    const deactivateProgram = (id) => dispatch(deactivateRewardProgram(id));

    const clearError = () => dispatch(clearRewardProgramError());
    const clearSuccess = () => dispatch(clearRewardProgramSuccess());
    const clearSelected = () => dispatch(clearSelectedRewardProgram());

    return {
        programs,
        selectedProgram,
        stats,
        loading,
        error,
        success,
        loadPrograms,
        loadProgramsByType,
        loadProgramById,
        loadStats,
        createProgram,
        updateProgram,
        removeProgram,
        activateProgram,
        deactivateProgram,
        clearError,
        clearSuccess,
        clearSelected
    };
};
