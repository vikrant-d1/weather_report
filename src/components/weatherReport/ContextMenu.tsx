import React,{useEffect,useRef} from 'react';
import ContextMenuProps from '../../interFaces/ContextMenuProps';

const ContextMenu = ({ x, y, onClose, onDelete }:ContextMenuProps) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const handleDeleteClick = () => {
        onDelete();
        onClose();
      };

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            onClose();
        }
      };
  
      document.addEventListener('mousedown', handleClickOutside);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [menuRef]);
  
    return (
      <div
        className='context_menu'
        style={{ position: "absolute", left: x, top: y }}
        onContextMenu={(e) => e.preventDefault()}
        ref={menuRef}
      >
        <ul>
          <li><i className="fa fa-eye" /> View</li>
          <li><i className="fa fa-pencil" /> Edit</li>
          <li onClick={handleDeleteClick}><i className="fa fa-trash-o" /> Delete</li>
        </ul>
      </div>
    );
  };

export default ContextMenu;



