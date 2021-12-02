import { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import styles from './Test.module.scss';

const Test = ({ className }) => {
    const canvas = useRef();

    const [dump, setDump] = useState();

    useEffect(() => {
        const handleResize = () => {
            canvas.current.width = window.innerWidth;
            canvas.current.height = 550;
            draw();
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const dragX = useRef();
    const dragStart = useRef();
    const dragLock = useRef();
    const dragRegister = useRef();
    const history = useRef([]);

    const draw = () => {
        const ctx = canvas.current.getContext('2d');
        ctx.save();
        ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
        ctx.scale(2, -1.5);
        ctx.translate(0, -canvas.current.height / 2);
        history.current.forEach(data => {
            // console.log(data);
            const xs = data[0].x;
            const ts = data[0].t;
            ctx.lineStyle = '#000';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            data.slice(1).forEach(point => {
                ctx.lineTo(point.t - ts, point.dx);
            });
            ctx.stroke();
        });
        ctx.restore();
    };

    const dragEnd = () => {
        // dragRegister.current.forEach(val => console.log(val));
        if (dragRegister.current.length > 1) {
            history.current.push(dragRegister.current);
        }
        setDump(JSON.stringify(dragRegister.current, undefined, 4));
        draw();
    };

    const addPointerEvents = () => {
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointercancel', handlePointerCancel);
        window.addEventListener('pointermove', handlePointerMove);
        canvas.current.addEventListener('touchmove', handleTouchMove);
    };

    const removePointerEvents = () => {
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerCancel);
        window.removeEventListener('pointermove', handlePointerMove);
        canvas.current.removeEventListener('touchmove', handleTouchMove);
    };

    const handlePointerDown = event => {
        if (event.isPrimary) {
            addPointerEvents();
            canvas.current.setPointerCapture(event.pointerId);
            dragStart.current = dragX.current = event.screenX;
            dragRegister.current = [];
            dragLock.current = false;
        }
    };

    const handlePointerUp = event => {
        if (event.isPrimary) {
            removePointerEvents();
            dragEnd();
        }
    };

    const handlePointerCancel = event => {
        if (event.isPrimary) {
            removePointerEvents();
            dragEnd();
        }
    };

    const handlePointerMove = event => {
        if (!event.isPrimary) return;
        const distTotal = Math.abs(event.screenX - dragStart.current);
        if (!dragLock.current && distTotal > 10) {
            dragLock.current = true;
        }
        const t = performance.now();
        const x = event.screenX;
        if (dragRegister.current.length) {
            const last = dragRegister.current[dragRegister.current.length - 1];
            if (x !== last.x) {
                dragRegister.current.push({
                    t,
                    x,
                    dt: t - last.t,
                    dx: x - last.x,
                });
            }
        } else {
            dragRegister.current.push({ t, x });
        }
    };

    const handleTouchMove = event => {
        if (dragLock.current) {
            event.preventDefault();
        }
    };

    return (
        <div className={cx(styles.root, className)}>
            <canvas
                ref={canvas}
                className={styles.canvas}
                onPointerDown={handlePointerDown}
            />
            <pre style={{ height: '100vh' }}>
                <code>{dump}</code>
            </pre>
        </div>
    );
};

Test.propTypes = {
    className: PropTypes.string,
};

export default Test;
