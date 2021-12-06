import { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { last } from 'utils';

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

    const dragStart = useRef();
    const dragScrollLock = useRef();
    const dragRegister = useRef();
    const history = useRef([]);

    const draw = () => {
        const ctx = canvas.current.getContext('2d');
        ctx.save();
        ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
        ctx.scale(2, -1.5);
        ctx.translate(0, -canvas.current.height / 2);
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.4)';
        ctx.lineWidth = 0.5;
        ctx.moveTo(0, 0);
        ctx.lineTo(1000, 0);
        ctx.stroke();
        for (let i = 0; i < 30; i++) {
            ctx.beginPath();
            ctx.moveTo(i * 16.666, -100);
            ctx.lineTo(i * 16.666, 300);
            ctx.stroke();
        }
        ctx.strokeStyle = '#000';
        history.current.forEach(data => {
            // console.log(data);
            // const xs = data[0].x;
            const ts = data[0].t;
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
        // Determine velocity v0
        let v0 = 0;
        // Disregard first sample
        dragRegister.current.shift();
        // Require at least 3 samples
        if (dragRegister.current.length >= 3) {
            // Latest sample must be less than 50ms old
            const t0 = performance.now();
            if (t0 - last(dragRegister.current).t < 50) {
                // Average the last max 5 sample velocities.
                // Latest samples are applied a smaller weight than older ones
                // because velocity tends to decrease significantly for
                // the last one or two samples
                let weightSum = 0;
                const relevantSamples = dragRegister.current
                    .slice(-5)
                    .reverse();
                relevantSamples.forEach((sample, i) => {
                    v0 += ((i + 1) * sample.dx) / sample.dt;
                    weightSum += i + 1;
                });
                v0 /= weightSum;
            }

            history.current.push(dragRegister.current);
        }
        setDump(
            `v0: ${v0} px/ms, ${(v0 * 1000) / 60} px/frame\n` +
                JSON.stringify(dragRegister.current, undefined, 4)
        );
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
        if (!event.isPrimary) return;
        addPointerEvents();
        canvas.current.setPointerCapture(event.pointerId);
        dragStart.current = { t: performance.now(), x: event.screenX };
        dragRegister.current = [];
        dragScrollLock.current = false;
    };

    const handlePointerUp = event => {
        if (!event.isPrimary) return;
        removePointerEvents();
        dragEnd();
    };

    const handlePointerCancel = event => {
        if (!event.isPrimary) return;
        removePointerEvents();
        dragEnd();
    };

    const handlePointerMove = event => {
        if (!event.isPrimary) return;
        if (!dragScrollLock.current) {
            // Dragged horizontally for at least 10px: This is a legit swipe.
            // Prevent-default touchmoves to stop browser from taking over.
            const distTotal = Math.abs(event.screenX - dragStart.current.x);
            dragScrollLock.current = distTotal >= 10;
        }
        // Determine position and velocity:
        const prev = last(dragRegister.current) || dragStart.current;
        const t = performance.now();
        const x = event.screenX;
        const dt = t - prev.t;
        const dx = x - prev.x;
        if (dx !== 0) {
            dragRegister.current.push({ t, x, dt, dx });
        }
    };

    const handleTouchMove = event => {
        if (dragScrollLock.current) {
            // Prevent-defaulting touchmove events:
            // - Browser won't take over the pointer and scroll anymore
            // - Pointer events are still dispatched to us
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
